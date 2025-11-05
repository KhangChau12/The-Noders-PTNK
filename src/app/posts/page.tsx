"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { NeuralNetworkBackground } from "@/components/NeuralNetworkBackground";
import { useLanguage } from "@/components/LanguageProvider";
import { LanguageDropdown } from "@/components/LanguageDropdown";
import { Post } from "@/types/database";
import {
  Search,
  Calendar,
  User,
  ArrowRight,
  TrendingUp,
  Users,
  Lightbulb,
  Award,
  BookOpen,
  Clock,
  Filter,
  ThumbsUp,
  Eye,
  UserCircle,
  X,
  ChevronDown,
  Check,
} from "lucide-react";

const categories = [
  { id: "all", name: "All Posts", icon: BookOpen, color: "text-text-primary" },
  { id: "News", name: "News", icon: TrendingUp, color: "text-primary-blue" },
  {
    id: "You may want to know",
    name: "Do You Know?",
    icon: Lightbulb,
    color: "text-warning",
  },
  {
    id: "Member Spotlight",
    name: "Member Spotlight",
    icon: Award,
    color: "text-success",
  },
  {
    id: "Community Activities",
    name: "Community Activities",
    icon: Users,
    color: "text-accent-purple",
  },
];

interface PostWithAuthor extends Post {
  author?: {
    id: string;
    username: string;
    full_name: string;
    avatar_url: string | null;
  };
  thumbnail_image?: {
    public_url: string;
  };
}

function CategoryBadge({ category }: { category: Post["category"] }) {
  const config = {
    News: { label: "News", variant: "primary" as const },
    "You may want to know": { label: "Do You Know?", variant: "tech" as const },
    "Member Spotlight": {
      label: "Member Spotlight",
      variant: "success" as const,
    },
    "Community Activities": {
      label: "Activities",
      variant: "warning" as const,
    },
  };

  const { label, variant } = config[category];
  return (
    <Badge variant={variant} size="sm">
      {label}
    </Badge>
  );
}

function PostCard({
  post,
  featured = false,
}: {
  post: PostWithAuthor;
  featured?: boolean;
}) {
  const { localize } = useLanguage();
  const cardClass = featured
    ? "bg-gradient-to-br from-primary-blue/5 to-accent-cyan/5 border-primary-blue/20"
    : "";

  const thumbnailSrc = post.thumbnail_image?.public_url || post.thumbnail_url;

  return (
    <Card variant="interactive" className={`h-full hover-lift ${cardClass}`}>
      <Link href={`/posts/${post.slug}`}>
        <div className="aspect-video relative overflow-hidden rounded-t-lg bg-gradient-to-br from-primary-blue/20 to-accent-cyan/20">
          {thumbnailSrc ? (
            <Image
              src={thumbnailSrc}
              alt={post.thumbnail_image?.alt_text || post.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-text-tertiary bg-dark-surface/50 backdrop-blur-sm">
              <svg
                className="w-12 h-12 mb-2 opacity-60"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
                />
              </svg>
              <span className="text-sm font-medium">No Image</span>
            </div>
          )}
          {featured && (
            <div className="absolute top-4 left-4">
              <Badge variant="primary" size="sm">
                Featured
              </Badge>
            </div>
          )}
          <div className="absolute top-4 right-4">
            <CategoryBadge category={post.category} />
          </div>
        </div>

        <CardContent className="p-6">
          <div className="flex items-center gap-4 text-xs text-text-tertiary mb-3">
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {new Date(post.created_at).toLocaleDateString()}
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {post.reading_time} min
            </div>
            {post.author && (
              <div className="flex items-center gap-1">
                <User className="w-3 h-3" />
                {post.author.full_name}
              </div>
            )}
          </div>

          <h3 className="text-lg font-semibold text-text-primary mb-2 line-clamp-2 group-hover:text-primary-blue transition-colors">
            {localize(post.title, post.title_vi)}
          </h3>

          <p className="text-text-secondary text-sm mb-4 line-clamp-3">
            {localize(post.summary, post.summary_vi)}
          </p>

          <div className="flex items-center gap-4 text-xs text-text-tertiary mb-4">
            <div className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              {post.view_count} views
            </div>
            <div className="flex items-center gap-1">
              <ThumbsUp className="w-3 h-3" />
              {post.upvote_count} upvotes
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" className="p-0 h-auto">
              Read More <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </div>
        </CardContent>
      </Link>
    </Card>
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
}: {
  authors: Author[];
  selectedAuthor: string;
  onSelect: (authorId: string) => void;
  loading: boolean;
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

  const getInitials = (name: string) => {
    const words = name.trim().split(" ");
    if (words.length === 1) return words[0].charAt(0).toUpperCase();
    return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
  };

  return (
    <div className="relative author-dropdown flex-1 lg:flex-none lg:min-w-[320px]">
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={loading}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 bg-dark-surface/80 backdrop-blur-sm border border-dark-border rounded-xl text-text-primary text-sm font-medium hover:border-primary-blue/50 hover:bg-dark-surface focus:outline-none focus:ring-2 focus:ring-primary-blue/50 focus:border-primary-blue transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group"
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {selectedAuthorData ? (
            <>
              {/* Author Avatar */}
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-primary-blue to-accent-cyan flex items-center justify-center text-white text-xs font-bold shadow-lg">
                {selectedAuthorData.avatar_url ? (
                  <img
                    src={selectedAuthorData.avatar_url}
                    alt={selectedAuthorData.full_name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  getInitials(selectedAuthorData.full_name)
                )}
              </div>
              <div className="flex-1 text-left min-w-0">
                <div className="font-semibold text-text-primary truncate">
                  {selectedAuthorData.full_name}
                </div>
                <div className="text-xs text-text-tertiary">
                  {selectedAuthorData.post_count}{" "}
                  {selectedAuthorData.post_count === 1 ? "post" : "posts"}
                </div>
              </div>
            </>
          ) : (
            <>
              <UserCircle className="w-5 h-5 text-text-tertiary transition-colors duration-300 group-hover:text-primary-blue" />
              <span className="text-text-secondary group-hover:text-text-primary transition-colors">
                All Authors
              </span>
            </>
          )}
        </div>

        {/* Chevron Icon */}
        <div className="flex-shrink-0">
          {loading ? (
            <div className="w-4 h-4 border-2 border-primary-blue/30 border-t-primary-blue rounded-full animate-spin" />
          ) : (
            <ChevronDown
              className={`w-4 h-4 text-text-tertiary transition-all duration-300 group-hover:text-primary-blue ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          )}
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && !loading && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-dark-surface border border-dark-border rounded-xl shadow-2xl shadow-black/50 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
            {/* All Authors Option */}
            <button
              onClick={() => {
                onSelect("");
                setIsOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-dark-border/50 transition-colors ${
                !selectedAuthor ? "bg-primary-blue/10 border-l-2 border-primary-blue" : ""
              }`}
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-dark-border to-dark-surface flex items-center justify-center">
                <UserCircle className="w-5 h-5 text-text-tertiary" />
              </div>
              <div className="flex-1 text-left">
                <div className="font-semibold text-text-primary">All Authors</div>
                <div className="text-xs text-text-tertiary">
                  {authors.reduce((sum, a) => sum + a.post_count, 0)} total posts
                </div>
              </div>
              {!selectedAuthor && (
                <Check className="w-4 h-4 text-primary-blue flex-shrink-0" />
              )}
            </button>

            {/* Divider */}
            <div className="h-px bg-dark-border my-1" />

            {/* Authors List */}
            {authors.map((author) => (
              <button
                key={author.id}
                onClick={() => {
                  onSelect(author.id);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-dark-border/50 transition-colors ${
                  selectedAuthor === author.id
                    ? "bg-primary-blue/10 border-l-2 border-primary-blue"
                    : ""
                }`}
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-primary-blue to-accent-cyan flex items-center justify-center text-white text-sm font-bold shadow-lg">
                  {author.avatar_url ? (
                    <img
                      src={author.avatar_url}
                      alt={author.full_name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    getInitials(author.full_name)
                  )}
                </div>
                <div className="flex-1 text-left min-w-0">
                  <div className="font-semibold text-text-primary truncate">
                    {author.full_name}
                  </div>
                  <div className="text-xs text-text-tertiary">
                    {author.post_count} {author.post_count === 1 ? "post" : "posts"}
                  </div>
                </div>
                {selectedAuthor === author.id && (
                  <Check className="w-4 h-4 text-primary-blue flex-shrink-0" />
                )}
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
  const [showFilters, setShowFilters] = useState(false);
  const [posts, setPosts] = useState<PostWithAuthor[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(true);
  const [authorsLoading, setAuthorsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch authors on mount
  useEffect(() => {
    const fetchAuthors = async () => {
      try {
        setAuthorsLoading(true);
        const response = await fetch('/api/posts/authors');
        const data = await response.json();

        if (data.success) {
          setAuthors(data.authors);
        }
      } catch (err) {
        console.error("Error fetching authors:", err);
      } finally {
        setAuthorsLoading(false);
      }
    };

    fetchAuthors();
  }, []);

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

  // Fetch posts when filters change
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
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

        const response = await fetch(`/api/posts?${params.toString()}`);
        const data = await response.json();

        if (data.success) {
          setPosts(data.posts);
          setError(null);
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
  }, [searchTerm, selectedCategory, selectedAuthor]);

  const featuredPosts = posts.filter((post) => post.featured);
  const regularPosts = posts.filter((post) => !post.featured);

  return (
    <>
      <NeuralNetworkBackground />
      <div className="relative min-h-screen py-12 px-4 sm:px-6 lg:px-8 z-10">
        <div className="container mx-auto">
          {/* Header */}
          <div className="mb-12">
            <div className="flex flex-col sm:flex-row items-center justify-between mb-4 gap-4">
              <div className="flex-1 text-center sm:text-left">
                <h1 className="text-4xl md:text-5xl font-bold text-text-primary">
                  Posts & Updates
                </h1>
              </div>
              <LanguageDropdown />
            </div>
            <p className="text-text-secondary text-lg text-center sm:text-left max-w-3xl">
              Stay updated with the latest news, educational content, member
              spotlights, and community activities from The Noders PTNK.
            </p>
          </div>

          {/* Search and Filters */}
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between mb-6">
              <div className="w-full lg:w-96">
                <Input
                  placeholder="Search posts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  icon={<Search className="w-4 h-4" />}
                />
              </div>

              <div className="flex gap-2 w-full lg:w-auto">
                {/* Author Filter Dropdown */}
                <AuthorDropdown
                  authors={authors}
                  selectedAuthor={selectedAuthor}
                  onSelect={setSelectedAuthor}
                  loading={authorsLoading}
                />

                <Button
                  variant="secondary"
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden"
                  icon={<Filter className="w-4 h-4" />}
                >
                  Filters
                </Button>
              </div>
            </div>

            {/* Categories */}
            <div
              className={`grid grid-cols-2 md:grid-cols-3 lg:flex lg:flex-wrap gap-2 ${
                showFilters ? "block" : "hidden lg:flex"
              }`}
            >
              {categories.map((category) => {
                const Icon = category.icon;
                const isActive = selectedCategory === category.id;

                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                      isActive
                        ? "border-primary-blue bg-primary-blue/10 text-primary-blue"
                        : "border-dark-border hover:border-dark-border/60 text-text-secondary hover:text-text-primary"
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 ${isActive ? "text-primary-blue" : category.color}`}
                    />
                    <span className="text-sm font-medium">{category.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="mb-8 text-center">
              <div className="inline-flex items-center gap-2 text-text-secondary">
                <div className="w-4 h-4 border-2 border-primary-blue/30 border-t-primary-blue rounded-full animate-spin" />
                Loading posts...
              </div>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="mb-8">
              <Card className="border-error/20 bg-error/10">
                <CardContent className="p-6 text-center">
                  <p className="text-error">{error}</p>
                  <Button
                    onClick={() => window.location.reload()}
                    variant="secondary"
                    size="sm"
                    className="mt-2"
                  >
                    Retry
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Active Filters & Results Count */}
          {!loading && !error && (
            <div className="mb-6">
              <div className="flex flex-wrap items-center gap-3 mb-3">
                {selectedAuthor && (
                  <Badge variant="secondary" className="flex items-center gap-2">
                    <UserCircle className="w-3 h-3" />
                    {authors.find((a) => a.id === selectedAuthor)?.full_name}
                    <button
                      onClick={() => setSelectedAuthor("")}
                      className="hover:text-error transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                )}
                {selectedCategory !== "all" && (
                  <Badge variant="secondary" className="flex items-center gap-2">
                    {categories.find((c) => c.id === selectedCategory)?.name}
                    <button
                      onClick={() => setSelectedCategory("all")}
                      className="hover:text-error transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                )}
                {(selectedAuthor || selectedCategory !== "all" || searchTerm) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSearchTerm("");
                      setSelectedCategory("all");
                      setSelectedAuthor("");
                    }}
                    className="text-text-tertiary hover:text-primary-blue"
                  >
                    Clear all filters
                  </Button>
                )}
              </div>
              <p className="text-text-secondary">
                {posts.length} post{posts.length !== 1 ? "s" : ""} found
              </p>
            </div>
          )}

          {/* Featured Posts */}
          {featuredPosts.length > 0 && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-text-primary mb-6 flex items-center gap-2">
                <Award className="w-6 h-6 text-primary-blue" />
                Featured Posts
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {featuredPosts.map((post) => (
                  <PostCard key={post.id} post={post} featured />
                ))}
              </div>
            </div>
          )}

          {/* Regular Posts */}
          {regularPosts.length > 0 ? (
            <div className="mb-12">
              {featuredPosts.length > 0 && (
                <h2 className="text-2xl font-bold text-text-primary mb-6">
                  Latest Posts
                </h2>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {regularPosts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            </div>
          ) : !loading && posts.length === 0 ? (
            <Card className="text-center py-12 mb-4">
              <CardContent>
                <div className="text-6xl mb-4 opacity-50">📰</div>
                <h3 className="text-xl font-semibold text-text-primary mb-2">
                  No posts found
                </h3>
                <p className="text-text-secondary mb-6">
                  {selectedCategory !== "all" || selectedAuthor || searchTerm
                    ? "Try adjusting your search criteria or filters."
                    : "No posts have been published yet. Check back soon!"}
                </p>
                {(selectedCategory !== "all" || selectedAuthor || searchTerm) && (
                  <Button
                    onClick={() => {
                      setSearchTerm("");
                      setSelectedCategory("all");
                      setSelectedAuthor("");
                    }}
                  >
                    Clear Filters
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : null}
        </div>
      </div>
    </>
  );
}
