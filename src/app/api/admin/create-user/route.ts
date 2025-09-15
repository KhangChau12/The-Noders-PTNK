import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    console.log('CreateUser API: Request received')
    const { email, password, profileData } = await request.json()

    console.log('CreateUser API: Request data received (email, profileData.full_name, profileData.username):', {
      email: email ? 'provided' : 'missing',
      password: password ? 'provided' : 'missing',
      full_name: profileData?.full_name ? 'provided' : 'missing',
      username: profileData?.username ? 'provided' : 'missing'
    })

    // Validate required fields
    if (!email || !password || !profileData?.full_name || !profileData?.username) {
      const missingFields = []
      if (!email) missingFields.push('email')
      if (!password) missingFields.push('password')
      if (!profileData?.full_name) missingFields.push('full_name')
      if (!profileData?.username) missingFields.push('username')

      console.error('CreateUser API: Missing required fields:', missingFields)
      return NextResponse.json(
        { success: false, error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      )
    }

    // Create Supabase client with auth headers from request
    console.log('CreateUser API: Checking authorization header...')
    const authHeader = request.headers.get('authorization')

    if (!authHeader) {
      console.error('CreateUser API: No authorization header found')
      return NextResponse.json(
        { success: false, error: 'Unauthorized: No authorization header provided. Please ensure you are logged in.' },
        { status: 401 }
      )
    }

    if (!authHeader.startsWith('Bearer ')) {
      console.error('CreateUser API: Invalid authorization header format:', authHeader.substring(0, 20) + '...')
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Invalid authorization header format. Expected "Bearer <token>".' },
        { status: 401 }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    console.log('CreateUser API: Token extracted, length:', token.length)

    const supabase = createClient()

    // Verify the token and get current user
    console.log('CreateUser API: Verifying user token...')
    const { data: { user: currentUser }, error: authError } = await supabase.auth.getUser(token)

    if (authError) {
      console.error('CreateUser API: Token verification failed:', authError.message)
      return NextResponse.json(
        { success: false, error: `Authentication failed: ${authError.message}` },
        { status: 401 }
      )
    }

    if (!currentUser) {
      console.error('CreateUser API: No user found for token')
      return NextResponse.json(
        { success: false, error: 'Unauthorized: No user found for the provided token. Please log in again.' },
        { status: 401 }
      )
    }

    console.log('CreateUser API: User verified:', currentUser.id)

    // Check if current user is admin
    console.log('CreateUser API: Checking admin role for user:', currentUser.id)
    const { data: currentProfile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', currentUser.id)
      .single()

    if (profileError) {
      console.error('CreateUser API: Error fetching user profile:', profileError.message)
      return NextResponse.json(
        { success: false, error: `Profile verification failed: ${profileError.message}` },
        { status: 500 }
      )
    }

    if (!currentProfile) {
      console.error('CreateUser API: No profile found for user:', currentUser.id)
      return NextResponse.json(
        { success: false, error: 'Profile not found. Please ensure your account is properly set up.' },
        { status: 403 }
      )
    }

    console.log('CreateUser API: User profile found, role:', currentProfile.role)

    if (currentProfile.role !== 'admin') {
      console.error('CreateUser API: User is not admin. Role:', currentProfile.role)
      return NextResponse.json(
        { success: false, error: `Access denied: Admin privileges required. Your current role is "${currentProfile.role}".` },
        { status: 403 }
      )
    }

    console.log('CreateUser API: Admin access verified')

    // Check if user with this email already exists
    console.log('CreateUser API: Checking for existing email:', email)
    const adminClient = createAdminClient()
    const { data: existingUser, error: listUsersError } = await adminClient.auth.admin.listUsers()

    if (listUsersError) {
      console.error('CreateUser API: Error listing users:', listUsersError.message)
      return NextResponse.json(
        { success: false, error: `Unable to verify email uniqueness: ${listUsersError.message}` },
        { status: 500 }
      )
    }

    const userExists = existingUser.users.some(u => u.email === email)

    if (userExists) {
      console.error('CreateUser API: Email already exists:', email)
      return NextResponse.json(
        { success: false, error: `A user with email "${email}" already exists` },
        { status: 400 }
      )
    }

    // Check if username is already taken
    console.log('CreateUser API: Checking for existing username:', profileData.username)
    const { data: existingProfile, error: usernameCheckError } = await adminClient
      .from('profiles')
      .select('username')
      .eq('username', profileData.username)
      .single()

    if (usernameCheckError && usernameCheckError.code !== 'PGRST116') { // PGRST116 = no rows found
      console.error('CreateUser API: Error checking username:', usernameCheckError.message)
      return NextResponse.json(
        { success: false, error: `Unable to verify username uniqueness: ${usernameCheckError.message}` },
        { status: 500 }
      )
    }

    if (existingProfile) {
      console.error('CreateUser API: Username already taken:', profileData.username)
      return NextResponse.json(
        { success: false, error: `Username "${profileData.username}" is already taken` },
        { status: 400 }
      )
    }

    console.log('CreateUser API: Email and username are available')

    // Create the auth user using Supabase Admin API
    console.log('CreateUser API: Creating auth user...')
    const { data: newUser, error: createAuthError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        full_name: profileData.full_name,
        username: profileData.username
      }
    })

    if (createAuthError) {
      console.error('CreateUser API: Failed to create auth user:', createAuthError.message)
      return NextResponse.json(
        { success: false, error: `Failed to create authentication account: ${createAuthError.message}` },
        { status: 500 }
      )
    }

    if (!newUser.user) {
      console.error('CreateUser API: No user returned from auth creation')
      return NextResponse.json(
        { success: false, error: 'Authentication account creation succeeded but no user object returned' },
        { status: 500 }
      )
    }

    console.log('CreateUser API: Auth user created successfully:', newUser.user.id)

    // Create profile
    console.log('CreateUser API: Creating user profile...')
    const profileInsertData = {
      id: newUser.user.id,
      username: profileData.username,
      full_name: profileData.full_name,
      avatar_url: profileData.avatar_url || null,
      bio: profileData.bio || null,
      skills: profileData.skills || [],
      role: profileData.role || 'member',
      social_links: profileData.social_links || {}
    }

    console.log('CreateUser API: Profile data to insert (without sensitive info):', {
      ...profileInsertData,
      id: 'user_id'
    })

    const { data: newProfile, error: profileInsertError } = await adminClient
      .from('profiles')
      .insert(profileInsertData)
      .select()
      .single()

    if (profileInsertError) {
      console.error('CreateUser API: Failed to create profile:', profileInsertError.message)

      // Clean up auth user if profile creation failed
      console.log('CreateUser API: Cleaning up auth user due to profile creation failure...')
      const { error: deleteError } = await adminClient.auth.admin.deleteUser(newUser.user.id)

      if (deleteError) {
        console.error('CreateUser API: Failed to clean up auth user:', deleteError.message)
      } else {
        console.log('CreateUser API: Auth user cleaned up successfully')
      }

      return NextResponse.json(
        { success: false, error: `Failed to create user profile: ${profileInsertError.message}. Authentication account has been cleaned up.` },
        { status: 500 }
      )
    }

    console.log('CreateUser API: Profile created successfully')

    console.log('CreateUser API: User creation completed successfully')

    return NextResponse.json({
      success: true,
      message: 'User created successfully',
      user: {
        id: newUser.user.id,
        email: newUser.user.email,
        profile: newProfile
      }
    })

  } catch (error) {
    console.error('CreateUser API: Unexpected error:', error)

    // Try to extract meaningful error information
    let errorMessage = 'Internal server error'
    if (error instanceof Error) {
      errorMessage = error.message
    } else if (typeof error === 'string') {
      errorMessage = error
    } else if (error && typeof error === 'object' && 'message' in error) {
      errorMessage = String(error.message)
    }

    return NextResponse.json(
      {
        success: false,
        error: `Unexpected error occurred: ${errorMessage}. Please try again or contact support if the issue persists.`
      },
      { status: 500 }
    )
  }
}