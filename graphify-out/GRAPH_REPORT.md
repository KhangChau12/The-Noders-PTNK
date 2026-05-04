# Graph Report - The Noders Community  (2026-04-22)

## Corpus Check
- 137 files · ~200,358 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 383 nodes · 436 edges · 18 communities detected
- Extraction: 89% EXTRACTED · 11% INFERRED · 0% AMBIGUOUS · INFERRED: 47 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 22|Community 22]]

## God Nodes (most connected - your core abstractions)
1. `GET()` - 27 edges
2. `POST()` - 22 edges
3. `createClient()` - 19 edges
4. `DELETE()` - 15 edges
5. `PUT()` - 14 edges
6. `verifyPostOwnership()` - 10 edges
7. `handleSubmit()` - 8 edges
8. `fetchPost()` - 7 edges
9. `SimpleCache` - 7 edges
10. `getAllPosts()` - 7 edges

## Surprising Connections (you probably didn't know these)
- `getStats()` --calls--> `createClient()`  [INFERRED]
  src\app\page.tsx → src\lib\supabase.ts
- `getRecentProjects()` --calls--> `createClient()`  [INFERRED]
  src\app\page.tsx → src\lib\supabase.ts
- `getRecentPosts()` --calls--> `createClient()`  [INFERRED]
  src\app\page.tsx → src\lib\supabase.ts
- `sitemap()` --calls--> `createClient()`  [INFERRED]
  src\app\sitemap.ts → src\lib\supabase.ts
- `fetchData()` --calls--> `createClient()`  [INFERRED]
  src\app\members\[id]\page.tsx → src\lib\supabase.ts

## Communities

### Community 0 - "Community 0"
Cohesion: 0.08
Nodes (16): createOwnershipKey(), invalidatePostOwnership(), SimpleCache, attachImageData(), canUserModifyProject(), DELETE(), GET(), getNextSequentialCertificate() (+8 more)

### Community 1 - "Community 1"
Cohesion: 0.08
Nodes (16): generateMetadata(), PostStructuredData(), ProjectStructuredData(), fetchStats(), getRecentPosts(), getRecentProjects(), getStats(), generateArticleSchema() (+8 more)

### Community 2 - "Community 2"
Cohesion: 0.1
Nodes (12): copyToClipboard(), deleteCertificate(), deleteUser(), fetchCertificates(), fetchUsers(), handleChange(), handleContestCountChange(), handleSubmit() (+4 more)

### Community 3 - "Community 3"
Cohesion: 0.1
Nodes (6): useAuth(), ImageUpload(), useLanguage(), AdminDashboardContent(), ProjectForm(), ProtectedRoute()

### Community 4 - "Community 4"
Cohesion: 0.16
Nodes (10): CategoryBadge(), fetchPosts(), getPostUrl(), handleClickOutside(), handleCopyLink(), handleDelete(), handleShareClick(), handleShareFacebook() (+2 more)

### Community 5 - "Community 5"
Cohesion: 0.12
Nodes (2): handleSubmit(), validateEmail()

### Community 6 - "Community 6"
Cohesion: 0.24
Nodes (11): createPost(), createPostTemplate(), deletePost(), ensureContentDir(), listPosts(), main(), showStats(), validatePosts() (+3 more)

### Community 7 - "Community 7"
Cohesion: 0.25
Nodes (13): calculateReadTime(), ensurePostsDirectory(), generateId(), generateSlug(), getAllPosts(), getFeaturedPosts(), getPostBySlug(), getPostFiles() (+5 more)

### Community 8 - "Community 8"
Cohesion: 0.21
Nodes (7): calculateReadingTime(), fetchData(), fetchPost(), handlePublish(), handleSaveChanges(), handleSaveDraft(), handleUpdateInfo()

### Community 9 - "Community 9"
Cohesion: 0.24
Nodes (4): deleteProject(), fetchProjects(), fetchUserProjects(), handleDeleteProject()

### Community 10 - "Community 10"
Cohesion: 0.29
Nodes (5): handlePointerMove(), handlePointerUp(), nudge(), onScroll(), wrapScrollPosition()

### Community 11 - "Community 11"
Cohesion: 0.29
Nodes (1): Loading()

### Community 12 - "Community 12"
Cohesion: 0.33
Nodes (2): executeCommand(), handleLinkSubmit()

### Community 13 - "Community 13"
Cohesion: 0.43
Nodes (4): countWordsFromHtml(), handleAddBlock(), handleUpdateBlock(), prepareContentForServer()

### Community 15 - "Community 15"
Cohesion: 0.4
Nodes (1): loc()

### Community 17 - "Community 17"
Cohesion: 0.67
Nodes (2): handleSubmit(), validateUrl()

### Community 19 - "Community 19"
Cohesion: 0.67
Nodes (2): extractVideoId(), handleUrlChange()

### Community 22 - "Community 22"
Cohesion: 1.0
Nodes (2): getInitialProjects(), ProjectsPage()

## Knowledge Gaps
- **Thin community `Community 5`** (16 nodes): `handleSubmit()`, `LoginForm.tsx`, `utils.ts`, `calculateProjectStats()`, `calculateReadingTime()`, `cn()`, `formatDate()`, `formatRelativeTime()`, `generateAvatarUrl()`, `generateRandomPassword()`, `getContributionColor()`, `getInitials()`, `slugify()`, `truncateText()`, `validateEmail()`, `validateUsername()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 11`** (7 nodes): `Loading()`, `Skeleton()`, `SkeletonCard()`, `SkeletonProfile()`, `SkeletonProject()`, `loading.tsx`, `Loading.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 12`** (7 nodes): `executeCommand()`, `handleCreateLink()`, `handleInput()`, `handleLinkSubmit()`, `handlePaste()`, `insertText()`, `RichTextEditor.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 15`** (5 nodes): `ComingSoonPlaceholder()`, `loc()`, `content.tsx`, `content.tsx`, `content.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 17`** (4 nodes): `handleKeyDown()`, `handleSubmit()`, `validateUrl()`, `LinkDialog.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 19`** (4 nodes): `YouTubeBlockEditor.tsx`, `extractVideoId()`, `handleSave()`, `handleUrlChange()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 22`** (3 nodes): `getInitialProjects()`, `ProjectsPage()`, `page.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `createClient()` connect `Community 1` to `Community 0`, `Community 8`, `Community 2`?**
  _High betweenness centrality (0.107) - this node is a cross-community bridge._
- **Why does `fetchCertificates()` connect `Community 2` to `Community 1`, `Community 4`?**
  _High betweenness centrality (0.061) - this node is a cross-community bridge._
- **Why does `fetchData()` connect `Community 8` to `Community 1`, `Community 2`?**
  _High betweenness centrality (0.053) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `GET()` (e.g. with `createClient()` and `createAdminClient()`) actually correct?**
  _`GET()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Are the 5 inferred relationships involving `POST()` (e.g. with `createClient()` and `.get()`) actually correct?**
  _`POST()` has 5 INFERRED edges - model-reasoned connections that need verification._
- **Are the 16 inferred relationships involving `createClient()` (e.g. with `getStats()` and `getRecentProjects()`) actually correct?**
  _`createClient()` has 16 INFERRED edges - model-reasoned connections that need verification._
- **Are the 4 inferred relationships involving `DELETE()` (e.g. with `createClient()` and `createAdminClient()`) actually correct?**
  _`DELETE()` has 4 INFERRED edges - model-reasoned connections that need verification._