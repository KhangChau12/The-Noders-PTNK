"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { PageHero } from "@/components/PageHero";
import { Container, FilterButton, Mono, NavySearch, SectionTitle } from "@/components/editorial";
import { useLanguage } from "@/components/LanguageProvider";
import { LanguageDropdown } from "@/components/LanguageDropdown";
import { Post } from "@/types/database";
import { cn } from "@/lib/utils";
import { UserCircle, X, ChevronDown, Check } from "lucide-react";

const categories = [
  { id: "all", name: "All" },
  { id: "Community Activities", name: "Community" },
  { id: "News", name: "News" },
  { id: "You may want to know", name: "Do you know?" },
  { id: "Tech Sharing", name: "Tech sharing" },
  { id: "Member Spotlight", name: "Member spotlight" },
];

const CATEGORY_LABEL: Record<string, string> = {
  "Community Activities": "Community",
  News: "News",
  "You may want to know": "Do you know?",
  "Tech Sharing": "Tech sharing",
  "Member Spotlight": "Member spotlight",
};

interface PostWithAuthor extends Post {
  author?: {
    id: string;
    username: string;
    full_name: string;
    avatar_url: string | null;
  };
  thumbnail_image?: {
    public_url: string;
    alt_text?: string;
  };
  thumbnail_url?: string | null;
}

function formatDate(value: string | null | undefined) {
  if (!value) return "";
  return new Date(value).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

/** Emoji in titles read as noise next to the editorial type. */
function cleanTitle(title: string) {
  return title.replace(/(?:[\u2600-\u27BF]|[\uD83C-\uDBFF][\uDC00-\uDFFF])\uFE0F?\s*/g, "").trim();
}

function postKicker(post: PostWithAuthor) {
  return `${CATEGORY_LABEL[post.category] ?? post.category} · ${formatDate(post.published_at || post.created_at)}`;
}

function postMeta(post: PostWithAuthor) {
  return [post.author?.full_name, post.reading_time ? `${post.reading_time} min` : null].filter(Boolean).join(" · ");
}

function Thumb({ post, sizes, priority }: { post: PostWithAuthor; sizes: string; priority?: boolean }) {
  const src = post.thumbnail_image?.public_url || post.thumbnail_url;
  return (
    <div className="relative aspect-video overflow-hidden rounded-[10px] bg-paper">
      {src && (
        <Image
          src={src}
          alt={post.thumbnail_image?.alt_text || cleanTitle(post.title)}
          fill
          priority={priority}
          sizes={sizes}
          className="object-cover"
        />
      )}
    </div>
  );
}

function LeadPost({ post }: { post: PostWithAuthor }) {
  const { localize } = useLanguage();
  return (
    <Link href={`/posts/${post.slug}`} className="group flex min-w-0 flex-[2_1_560px] flex-col gap-3.5">
      <Thumb post={post} priority sizes="(max-width: 1024px) 100vw, 720px" />
      <span className="mt-1.5 text-sm font-semibold text-link">{postKicker(post)}</span>
      <h2 className="text-[26px] sm:text-[34px] font-bold leading-[1.12] tracking-[-0.025em] text-text-primary group-hover:text-link transition-colors">
        {cleanTitle(localize(post.title, post.title_vi))}
      </h2>
      <p className="max-w-[640px] text-text-secondary leading-relaxed line-clamp-3">{localize(post.summary, post.summary_vi)}</p>
      <span className="text-sm text-text-tertiary">{postMeta(post)}</span>
    </Link>
  );
}

function SecondaryPost({ post }: { post: PostWithAuthor }) {
  const { localize } = useLanguage();
  return (
    <Link href={`/posts/${post.slug}`} className="group flex flex-col gap-2.5">
      <Thumb post={post} sizes="(max-width: 1024px) 100vw, 380px" />
      <span className="text-sm font-semibold text-link">{postKicker(post)}</span>
      <h3 className="text-[19px] font-bold leading-snug tracking-[-0.01em] text-text-primary group-hover:text-link transition-colors">
        {cleanTitle(localize(post.title, post.title_vi))}
      </h3>
    </Link>
  );
}

function PostRow({ post }: { post: PostWithAuthor }) {
  const { localize } = useLanguage();
  return (
    <li className="border-t border-rule">
      <Link href={`/posts/${post.slug}`} className="group flex flex-wrap gap-x-8 gap-y-2 py-[26px]">
        <div className="flex flex-[0_0_150px] flex-col gap-1">
          <Mono>{formatDate(post.published_at || post.created_at)}</Mono>
          <span className="text-[13px] font-semibold text-link">{CATEGORY_LABEL[post.category] ?? post.category}</span>
        </div>
        <div className="min-w-0 flex-[1_1_520px]">
          <h3 className="mb-1.5 text-xl font-bold leading-snug tracking-[-0.01em] text-text-primary group-hover:text-link transition-colors">
            {cleanTitle(localize(post.title, post.title_vi))}
          </h3>
          <p className="max-w-[680px] text-[15px] leading-relaxed text-text-secondary line-clamp-2">
            {localize(post.summary, post.summary_vi)}
          </p>
        </div>
        <span className="text-sm text-text-tertiary">{postMeta(post)}</span>
      </Link>
    </li>
  );
}

// Topics the reel can show; the first one is the default.
const REEL_TOPICS = [
  { id: "You may want to know", name: "Do you know?" },
  { id: "News", name: "News" },
  { id: "Community Activities", name: "Community" },
];

/**
 * Horizontal, slowly scrolling gallery of one topic's posts. The list is
 * rendered twice so the CSS loop is seamless; the copy is hidden from
 * assistive tech and the keyboard. Pauses on hover/focus, via the button,
 * and stays still for prefers-reduced-motion (see .reel in globals.css).
 */
function TopicReel({
  topic,
  onTopicChange,
  posts,
}: {
  topic: string;
  onTopicChange: (topic: string) => void;
  posts: PostWithAuthor[];
}) {
  const { localize } = useLanguage();
  const [paused, setPaused] = useState(false);
  const items = [
    ...posts.map((p) => ({ post: p, copy: false })),
    ...posts.map((p) => ({ post: p, copy: true })),
  ];

  return (
    <section aria-labelledby="reel-title" className="pt-20 sm:pt-24">
      <Container className="mb-7 flex flex-wrap items-center justify-between gap-4">
        <SectionTitle id="reel-title" className="!text-2xl sm:!text-[32px]">Browse by topic</SectionTitle>
        <div className="flex flex-wrap items-center gap-2">
          <div role="group" aria-label="Gallery topic" className="flex flex-wrap gap-2">
            {REEL_TOPICS.map((t) => (
              <FilterButton key={t.id} active={topic === t.id} onClick={() => onTopicChange(t.id)}>
                {t.name}
              </FilterButton>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setPaused((v) => !v)}
            aria-label={paused ? "Play the gallery" : "Pause the gallery"}
            className="inline-flex min-h-[40px] items-center rounded-md border border-control px-3 text-sm font-medium text-text-secondary hover:border-text-tertiary hover:text-text-primary"
          >
            {paused ? "Play" : "Pause"}
          </button>
        </div>
      </Container>

      {posts.length > 0 ? (
        // The track lives inside the same Container as the page content, so its
        // left edge lines up exactly; the .reel wrapper clips at the viewport.
        <div className="reel overflow-hidden">
          <Container>
            <ul
              className={cn("reel-track flex w-max", paused && "is-paused")}
              style={{ animationDuration: `${posts.length * 6}s` }}
            >
              {items.map(({ post, copy }, i) => {
                const src = post.thumbnail_image?.public_url || post.thumbnail_url;
                return (
                  // Spacing is padding on each item (not `gap`) so the -50% loop lands exactly.
                  <li key={`${post.id}-${i}`} aria-hidden={copy || undefined} className="w-[320px] shrink-0 pr-5">
                    <Link href={`/posts/${post.slug}`} tabIndex={copy ? -1 : undefined} className="group flex flex-col gap-2.5">
                      <div className="relative aspect-[16/10] overflow-hidden rounded-[10px] bg-paper">
                        {src && <Image src={src} alt="" fill sizes="300px" className="object-cover" />}
                      </div>
                      <Mono className="text-xs">{formatDate(post.published_at || post.created_at)}</Mono>
                      <span className="line-clamp-2 text-base font-semibold leading-snug text-text-primary group-hover:text-link transition-colors">
                        {cleanTitle(localize(post.title, post.title_vi))}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </Container>
        </div>
      ) : (
        <Container>
          <p className="text-text-secondary">Loading…</p>
        </Container>
      )}
    </section>
  );
}

interface Author {
  id: string;
  username: string;
  full_name: string;
  avatar_url: string | null;
  post_count: number;
}

function AuthorDropdown({
  authors,
  selectedAuthor,
  onSelect,
  loading,
  onOpen,
  totalPosts,
}: {
  authors: Author[];
  selectedAuthor: string;
  onSelect: (authorId: string) => void;
  loading: boolean;
  onOpen?: () => void;
  totalPosts?: number;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedAuthorData = authors.find((a) => a.id === selectedAuthor);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".author-dropdown")) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Fetch fresh data when dropdown opens
  useEffect(() => {
    if (isOpen && onOpen) {
      onOpen();
    }
  }, [isOpen, onOpen]);

  return (
    <div className="relative author-dropdown flex-1 sm:flex-none sm:min-w-[220px]">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={loading}
        aria-expanded={isOpen}
        className="flex min-h-[44px] w-full items-center justify-between gap-3 rounded-md border border-control bg-paper px-3.5 text-sm font-medium text-text-primary transition-colors hover:border-text-tertiary disabled:opacity-50"
      >
        <span className="flex min-w-0 items-center gap-2">
          <UserCircle className="h-4 w-4 shrink-0 text-text-tertiary" />
          <span className="truncate">{selectedAuthorData ? selectedAuthorData.full_name : "All authors"}</span>
        </span>
        {loading ? (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-control border-t-text-primary" />
        ) : (
          <ChevronDown className={cn("h-4 w-4 text-text-tertiary transition-transform", isOpen && "rotate-180")} />
        )}
      </button>

      {isOpen && !loading && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-lg border border-control bg-paper shadow-xl sm:left-auto sm:w-[300px]">
          <div className="max-h-[400px] overflow-y-auto custom-scrollbar py-1">
            <button
              onClick={() => {
                onSelect("");
                setIsOpen(false);
              }}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-white/[0.04]"
            >
              <span className="flex-1 text-sm font-medium text-text-primary">All authors</span>
              <Mono className="tracking-normal">
                {totalPosts !== undefined ? totalPosts : authors.reduce((sum, a) => sum + a.post_count, 0)}
              </Mono>
              {!selectedAuthor && <Check className="h-4 w-4 text-text-primary" />}
            </button>
            <div className="my-1 h-px bg-rule" />
            {authors.map((author) => (
              <button
                key={author.id}
                onClick={() => {
                  onSelect(author.id);
                  setIsOpen(false);
                }}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-white/[0.04]"
              >
                <span className="flex-1 truncate text-sm text-text-primary">{author.full_name}</span>
                <Mono className="tracking-normal">{author.post_count}</Mono>
                {selectedAuthor === author.id && <Check className="h-4 w-4 text-text-primary" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function PostsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const [selectedCategory, setSelectedCategory] = useState<string>(
    searchParams.get("category") || "all"
  );
  const [selectedAuthor, setSelectedAuthor] = useState<string>(
    searchParams.get("author") || ""
  );
  const [posts, setPosts] = useState<PostWithAuthor[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [authorsLoading, setAuthorsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState<number>(0);
  const POSTS_PER_PAGE = 20;

  // Fetch authors helper - memoized to avoid recreating on every render
  const fetchAuthors = useCallback(async () => {
    try {
      setAuthorsLoading(true);
      const response = await fetch(`/api/posts/authors`);
      const data = await response.json();

      if (data.success) {
        setAuthors(data.authors);
      }
    } catch (err) {
      console.error("Error fetching authors:", err);
    } finally {
      setAuthorsLoading(false);
    }
  }, []);

  // Fetch authors on mount
  useEffect(() => {
    fetchAuthors();
  }, [fetchAuthors]);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();

    if (searchTerm) {
      params.set("search", searchTerm);
    }
    if (selectedCategory !== "all") {
      params.set("category", selectedCategory);
    }
    if (selectedAuthor) {
      params.set("author", selectedAuthor);
    }

    const newUrl = params.toString() ? `?${params.toString()}` : "/posts";
    router.replace(newUrl, { scroll: false });
  }, [searchTerm, selectedCategory, selectedAuthor, router]);

  // Fetch posts when filters change (reset to page 1)
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        setPage(1);
        const params = new URLSearchParams();

        if (searchTerm) {
          params.set("search", searchTerm);
        }
        if (selectedCategory !== "all") {
          params.set("category", selectedCategory);
        }
        if (selectedAuthor) {
          params.set("author", selectedAuthor);
        }

        params.set("limit", POSTS_PER_PAGE.toString());
        params.set("offset", "0");

        const response = await fetch(`/api/posts?${params.toString()}`);
        const data = await response.json();

        if (data.success) {
          setPosts(data.posts);
          setHasMore(data.pagination?.hasMore || false);
          setTotalCount(data.total || 0);
          setError(null);

          // Refetch authors to ensure dropdown is up-to-date
          fetchAuthors();
        } else {
          setError(data.error || "Failed to fetch posts");
        }
      } catch (err) {
        setError("Network error occurred");
        console.error("Error fetching posts:", err);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(fetchPosts, 300);
    return () => clearTimeout(timeoutId);
  }, [searchTerm, selectedCategory, selectedAuthor, POSTS_PER_PAGE, fetchAuthors]);

  // Load more posts (infinite scroll)
  const loadMorePosts = async () => {
    if (loadingMore || !hasMore) return;

    try {
      setLoadingMore(true);
      const params = new URLSearchParams();

      if (searchTerm) {
        params.set("search", searchTerm);
      }
      if (selectedCategory !== "all") {
        params.set("category", selectedCategory);
      }
      if (selectedAuthor) {
        params.set("author", selectedAuthor);
      }

      const offset = page * POSTS_PER_PAGE;
      params.set("limit", POSTS_PER_PAGE.toString());
      params.set("offset", offset.toString());

      const response = await fetch(`/api/posts?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setPosts(prev => [...prev, ...data.posts]);
        setHasMore(data.pagination?.hasMore || false);
        setPage(prev => prev + 1);
      }
    } catch (err) {
      console.error("Error loading more posts:", err);
    } finally {
      setLoadingMore(false);
    }
  };

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading && !loadingMore) {
          loadMorePosts();
        }
      },
      { threshold: 0.1 }
    );

    const sentinel = document.getElementById('scroll-sentinel');
    if (sentinel) {
      observer.observe(sentinel);
    }

    return () => {
      if (sentinel) {
        observer.unobserve(sentinel);
      }
    };
  }, [hasMore, loading, loadingMore, page, searchTerm, selectedCategory, selectedAuthor]);

  const hasFilters = selectedCategory !== "all" || !!selectedAuthor || !!searchTerm;
  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("all");
    setSelectedAuthor("");
  };

  // Top of the page: the three newest Community posts, fetched separately so
  // they stay put regardless of the list below.
  const [communityPosts, setCommunityPosts] = useState<PostWithAuthor[]>([]);
  useEffect(() => {
    fetch(`/api/posts?category=${encodeURIComponent("Community Activities")}&limit=3&offset=0`)
      .then((r) => r.json())
      .then((data) => data.success && setCommunityPosts(data.posts))
      .catch((err) => console.error("Error fetching community posts:", err));
  }, []);

  // Topic reel: a slow horizontal gallery so more posts are seen with their
  // cover image. Defaults to "Do you know?"; visitors can switch topic.
  const [reelTopic, setReelTopic] = useState<string>(REEL_TOPICS[0].id);
  const [reelPosts, setReelPosts] = useState<PostWithAuthor[]>([]);
  useEffect(() => {
    let cancelled = false;
    fetch(`/api/posts?category=${encodeURIComponent(reelTopic)}&limit=12&offset=0`)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled || !data.success) return;
        setReelPosts(data.posts.filter((p: PostWithAuthor) => p.thumbnail_image?.public_url || p.thumbnail_url));
      })
      .catch((err) => console.error("Error fetching reel posts:", err));
    return () => {
      cancelled = true;
    };
  }, [reelTopic]);

  const [lead, ...secondary] = communityPosts;
  const showIntroBlocks = !hasFilters;

  return (
    <div>
      <PageHero
        eyebrow="Posts"
        title="Written by members."
        description="Contest recaps, launch notes, and short explainers on the tech around you."
        aside={
          <NavySearch
            id="post-search"
            label="Search posts"
            placeholder="Title, topic or summary"
            value={searchTerm}
            onChange={setSearchTerm}
          />
        }
      />

      {/* Three newest Community posts */}
      {showIntroBlocks && lead && (
        <section className="pt-16 sm:pt-[72px]">
          <Container>
            <div className="flex flex-wrap gap-10">
              <LeadPost post={lead} />
              <div className="flex min-w-0 flex-[1_1_320px] flex-col gap-8">
                {secondary.slice(0, 2).map((post) => (
                  <SecondaryPost key={post.id} post={post} />
                ))}
              </div>
            </div>
          </Container>
        </section>
      )}

      {showIntroBlocks && (
        <TopicReel topic={reelTopic} onTopicChange={setReelTopic} posts={reelPosts} />
      )}

      {/* Filters + list */}
      <section className="pt-20 pb-20 sm:pt-24 sm:pb-28">
        <Container>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-[28px] sm:text-[34px] lg:text-[40px] font-bold leading-[1.15] tracking-[-0.025em] text-text-primary">
              {hasFilters ? `${totalCount} post${totalCount !== 1 ? "s" : ""} found` : "All posts"}
            </h2>
            <div className="flex items-center gap-2">
              <AuthorDropdown
                authors={authors}
                selectedAuthor={selectedAuthor}
                onSelect={setSelectedAuthor}
                loading={authorsLoading}
                onOpen={fetchAuthors}
                totalPosts={totalCount}
              />
              <LanguageDropdown />
            </div>
          </div>

          <div role="group" aria-label="Filter by category" className="no-scrollbar -mx-4 mb-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
            {categories.map((category) => (
              <FilterButton
                key={category.id}
                active={selectedCategory === category.id}
                onClick={() => setSelectedCategory(category.id)}
              >
                {category.name}
              </FilterButton>
            ))}
            {hasFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex min-h-[40px] shrink-0 items-center gap-1.5 px-2 text-sm font-medium text-text-tertiary hover:text-text-primary"
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
                Clear filters
              </button>
            )}
          </div>

          {loading && (
            <p className="flex items-center gap-2 border-t border-rule py-8 text-text-secondary">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-control border-t-text-primary" />
              Loading posts…
            </p>
          )}

          {error && !loading && (
            <div className="border-t border-rule py-8">
              <p className="mb-3 text-error">{error}</p>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="inline-flex min-h-[40px] items-center rounded-md border border-control px-4 text-sm font-semibold text-text-primary hover:border-text-tertiary"
              >
                Retry
              </button>
            </div>
          )}

          {!loading && !error && posts.length > 0 && (
            <>
              <ul className="border-b border-rule">
                {posts.map((post) => (
                  <PostRow key={post.id} post={post} />
                ))}
              </ul>

              {hasMore && (
                <div id="scroll-sentinel" className="py-8 text-center">
                  {loadingMore && (
                    <span className="inline-flex items-center gap-2 text-text-secondary">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-control border-t-text-primary" />
                      Loading more posts…
                    </span>
                  )}
                </div>
              )}
            </>
          )}

          {!loading && !error && posts.length === 0 && (
            <div className="border-t border-rule py-12">
              <h3 className="mb-2 text-xl font-semibold text-text-primary">No posts found</h3>
              <p className="mb-5 text-text-secondary">
                {hasFilters ? "Try a different search or category." : "Nothing published yet. Check back soon."}
              </p>
              {hasFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="inline-flex min-h-[44px] items-center rounded-md bg-text-primary px-5 font-semibold text-ink hover:bg-white"
                >
                  Clear filters
                </button>
              )}
            </div>
          )}
        </Container>
      </section>
    </div>
  );
}
