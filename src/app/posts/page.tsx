"use client";

import { useState, useEffect } from "react";
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
} from "lucide-react";

const categories = [
  { id: "all", name: "All Posts", icon: BookOpen, color: "text-text-primary" },
  { id: "News", name: "News", icon: TrendingUp, color: "text-primary-blue" },
  {
    id: "You may want to know",
    name: "You May Want to Know",
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
    "You may want to know": { label: "Educational", variant: "tech" as const },
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

export default function PostsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [posts, setPosts] = useState<PostWithAuthor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
  }, [searchTerm, selectedCategory]);

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

              <Button
                variant="secondary"
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden"
                icon={<Filter className="w-4 h-4" />}
              >
                Filters
              </Button>
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

          {/* Results Count */}
          {!loading && !error && (
            <div className="mb-6">
              <p className="text-text-secondary">
                {posts.length} post{posts.length !== 1 ? "s" : ""} found
                {selectedCategory !== "all" && (
                  <span>
                    {" "}
                    in {categories.find((c) => c.id === selectedCategory)?.name}
                  </span>
                )}
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
                  {selectedCategory !== "all" || searchTerm
                    ? "Try adjusting your search criteria or filters."
                    : "No posts have been published yet. Check back soon!"}
                </p>
                {(selectedCategory !== "all" || searchTerm) && (
                  <Button
                    onClick={() => {
                      setSearchTerm("");
                      setSelectedCategory("all");
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
