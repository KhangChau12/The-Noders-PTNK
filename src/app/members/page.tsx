'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useMembers } from '@/lib/hooks'
import { Card, CardContent } from '@/components/Card'
import { Badge } from '@/components/Badge'
import { Button } from '@/components/Button'
import { Input } from '@/components/Input'
import { Loading, SkeletonProfile } from '@/components/Loading'
import { MemberFilters } from '@/types/member'
import { getInitials } from '@/lib/utils'
import { Avatar } from '@/components/Avatar'
import { ClickableBadge } from '@/components/ClickableBadge'
import { Search, Users, Mail, Facebook, Award } from 'lucide-react'

export default function MembersPage() {
  const [filters, setFilters] = useState<MemberFilters>({
    role: 'all',
    search: '',
    sort_by: 'full_name',
    sort_order: 'asc'
  })
  
  const { members, loading, error } = useMembers(filters)

  const handleSearchChange = (value: string) => {
    setFilters(prev => ({ ...prev, search: value }))
  }

  const handleRoleFilter = (role: string) => {
    setFilters(prev => ({ ...prev, role: role as any }))
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-text-primary mb-4">
            Meet Our Team
          </h1>
          <p className="text-text-secondary text-lg max-w-2xl mx-auto">
            Get to know the passionate individuals behind The Noders PTNK.
            Our diverse team brings together expertise from various fields to create amazing projects.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="w-full lg:w-96">
              <Input
                placeholder="Search members..."
                value={filters.search || ''}
                onChange={(e) => handleSearchChange(e.target.value)}
                icon={<Search className="w-4 h-4" />}
              />
            </div>
            
            {/* Role Filters */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-text-secondary">Role:</span>
              <div className="flex space-x-2">
                {[
                  { label: 'All', value: 'all' },
                  { label: 'Members', value: 'member' },
                  { label: 'Admins', value: 'admin' }
                ].map((option) => (
                  <ClickableBadge
                    key={option.value}
                    variant={filters.role === option.value ? 'primary' : 'secondary'}
                    className="hover:opacity-80"
                    onClick={() => handleRoleFilter(option.value)}
                  >
                    {option.label}
                  </ClickableBadge>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Results Count */}
        {!loading && members && (
          <div className="mb-6">
            <p className="text-text-secondary">
              {members.length} member{members.length !== 1 ? 's' : ''} found
            </p>
          </div>
        )}

        {/* Members Grid */}
        <div className="mb-12">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <SkeletonProfile key={i} />
              ))}
            </div>
          ) : error ? (
            <Card className="text-center py-12">
              <CardContent>
                <p className="text-error mb-4">Failed to load members</p>
                <p className="text-text-secondary">{error}</p>
              </CardContent>
            </Card>
          ) : members && members.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {members.map((member) => {
                // Use CSS Avatar component instead of external image
                const socialLinks = member.social_links || {}
                const projectCount = (member.contributed_projects?.length || 0)
                console.log(members);
                
                return (
                  <Link key={member.id} href={`/members/${member.username}`}>
                    <Card variant="interactive" className="h-full hover-lift">
                      <CardContent className="p-2 text-center">
                        {/* Avatar */}
                        <div className="relative mx-auto mb-4 flex justify-center">
                          <Avatar
                            name={member.avatar_url ? null : member.full_name}
                            size="xl"
                          />
                          {member.role === 'admin' && (
                            <div className="absolute -top-1 -right-1 w-8 h-8 bg-primary-blue rounded-full flex items-center justify-center">
                              <Award className="w-5 h-5 text-white" />
                            </div>
                          )}
                        </div>
                        
                        {/* Name and Username */}
                        <h3 className="text-lg font-semibold text-text-primary mb-1">
                          {member.full_name || member.username}
                        </h3>
                        <p className="text-text-secondary text-sm mb-3">
                          @{member.username}
                        </p>
                        
                        {/* Role Badge */}
                        <div className="mb-4">
                          <Badge variant={member.role === 'admin' ? 'primary' : 'secondary'} size="sm">
                            {member.role === 'admin' ? 'Admin' : 'Member'}
                          </Badge>
                        </div>
                        
                        {/* Bio */}
                        {member.bio && (
                          <p className="text-text-secondary text-sm mb-4 line-clamp-2">
                            {member.bio}
                          </p>
                        )}
                        
                        {/* Skills */}
                        {member.skills && member.skills.length > 0 && (
                          <div className="mb-4">
                            <div className="flex flex-wrap gap-1 justify-center">
                              {member.skills.slice(0, 3).map((skill, index) => (
                                <Badge key={index} variant="tech" size="sm">
                                  {skill}
                                </Badge>
                              ))}
                              {member.skills.length > 3 && (
                                <Badge variant="secondary" size="sm">
                                  +{member.skills.length - 3}
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}
                        
                        {/* Project Count */}
                        <div className="mb-4">
                          <p className="text-sm text-text-tertiary">
                            {projectCount} project{projectCount !== 1 ? 's' : ''}
                          </p>
                        </div>
                        
                        {/* Contact Links */}
                        <div className="flex justify-center space-x-3 pt-4 border-t border-dark-border">
                          <a
                            href="mailto:phuckhangtdn@gmail.com"
                            className="text-text-tertiary hover:text-primary-blue transition-colors"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Mail className="w-4 h-4" />
                          </a>
                          {socialLinks.facebook && (
                            <a
                              href={socialLinks.facebook}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-text-tertiary hover:text-primary-blue transition-colors"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Facebook className="w-4 h-4" />
                            </a>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                )
              })}
            </div>
          ) : (
            <Card className="text-center py-12">
              <CardContent>
                <div className="text-6xl mb-4 opacity-50">👥</div>
                <h3 className="text-xl font-semibold text-text-primary mb-2">
                  No members found
                </h3>
                <p className="text-text-secondary">
                  Try adjusting your search criteria or filters.
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* CTA Section */}
        <Card className="text-center bg-gradient-to-r from-primary-blue/10 to-accent-cyan/10 border-primary-blue/20">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold text-text-primary mb-4">
              Interested in Joining?
            </h2>
            <p className="text-text-secondary mb-6">
              We're always looking for passionate individuals to join our AI community.
            </p>
            <Button size="lg">
              Learn How to Join
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}