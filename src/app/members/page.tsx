"use client";

import { useState } from "react";
import Link from "next/link";
import { useMembers } from "@/lib/hooks";
import { Card, CardContent } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { SkeletonProfile } from "@/components/Loading";
import { MemberFilters } from "@/types/member";
import { Avatar } from "@/components/Avatar";
import { ClickableBadge } from "@/components/ClickableBadge";
import { NeuralNetworkBackground } from "@/components/NeuralNetworkBackground";
import { Search, Award, FileText, Calendar, ClipboardList } from "lucide-react";


export default function MembersPage() {
  const [filters, setFilters] = useState<MemberFilters>({
    role: "all",
    search: "",
    sort_by: "full_name",
    sort_order: "asc",
  });
  const { members, loading, error } = useMembers(filters);

  const handleSearchChange = (value: string) => {
    setFilters((prev) => ({ ...prev, search: value }));
  };

  const handleRoleFilter = (role: string) => {
    setFilters((prev) => ({ ...prev, role: role as any }));
  };

  return (
    <>
      <NeuralNetworkBackground />
      <div className="relative min-h-screen py-12 px-4 sm:px-6 lg:px-8 z-10">
        <div className="container mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold font-heading text-text-primary mb-4">
              Meet Our Team
            </h1>
            <p className="text-text-secondary text-lg max-w-3xl mx-auto">
              Get to know the passionate individuals behind The Noders Community. Our
              diverse team brings together expertise from various fields to
              create amazing projects.
            </p>
          </div>

          {/* Search and Filters */}
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
              {/* Search */}
              <div className="w-full lg:w-96">
                <Input
                  placeholder="Search members..."
                  value={filters.search || ""}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  icon={<Search className="w-4 h-4" />}
                />
              </div>

              {/* Role Filters */}
              <div className="flex items-center space-x-2">
                <span className="text-sm text-text-secondary">Role:</span>
                <div className="flex space-x-2">
                  {[
                    { label: "All", value: "all" },
                    { label: "Members", value: "member" },
                    { label: "Core Team", value: "admin" },
                  ].map((option) => (
                    <ClickableBadge
                      key={option.value}
                      variant={
                        filters.role === option.value ? "primary" : "secondary"
                      }
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
              <div className="inline-flex items-center rounded-full border border-dark-border bg-dark-surface/60 px-4 py-2 text-sm text-text-secondary">
                {members.length} member{members.length !== 1 ? "s" : ""} found
              </div>
            </div>
          )}

          {/* Members Grid */}
          <div className="mb-12">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
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
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {members.map((member) => {
                  const totalPoints = member.total_points || 0;
                  const postCount = member.posts_count || 0;
                  const certCount = member.certificate_count || 0;
                  const totalViews = member.total_post_views || 0;
                  const taskCount = member.task_count || 0;
                  const joinDate = new Date(member.created_at).toLocaleDateString('en-US', {
                    day: '2-digit', month: 'short', year: 'numeric'
                  });

                  return (
                    <div key={member.id}>
                      <Link href={`/members/${member.id}`} className="block">
                        <Card
                          variant="interactive"
                          className={`group relative h-[305px] overflow-hidden rounded-2xl border-2 bg-gradient-to-br from-dark-surface/90 to-dark-bg/90 transition-all duration-500 ${
                            member.role === 'admin'
                              ? 'border-primary-blue/40 hover:border-primary-blue/70 hover:shadow-xl hover:shadow-primary-blue/20'
                              : 'border-dark-border/70 hover:border-accent-cyan/50 hover:shadow-xl hover:shadow-accent-cyan/10'
                          }`}
                        >
                          <div className="absolute inset-0 bg-gradient-to-br from-primary-blue/0 to-accent-cyan/0 group-hover:from-primary-blue/5 group-hover:to-accent-cyan/5 transition-all duration-500 pointer-events-none" />

                          <CardContent className="relative z-10 p-4">
                            <div className="flex items-start justify-between gap-3 mb-3">
                              <div className="flex items-center gap-3 min-w-0">
                                <div className={`${member.role === 'admin' ? 'p-0.5 bg-gradient-to-br from-primary-blue to-accent-cyan rounded-full' : ''}`}>
                                  <Avatar
                                    name={member.full_name}
                                    src={member.avatar_url}
                                    size="lg"
                                    className="border-2 border-dark-surface"
                                  />
                                </div>
                                <div className="min-w-0">
                                  <h3 className="text-base font-bold text-text-primary truncate group-hover:text-primary-blue transition-colors">
                                    {member.full_name || member.username}
                                  </h3>
                                  <p className="text-xs text-text-secondary truncate">@{member.username}</p>
                                </div>
                              </div>

                              <div className="flex flex-col items-end">
                                {member.role === "admin" && (
                                  <Badge variant="primary" size="sm" className="shadow-lg shadow-primary-blue/20">
                                    Core Team
                                  </Badge>
                                )}
                              </div>
                            </div>

                            <p className="text-xs text-text-secondary leading-relaxed line-clamp-2 mb-3 min-h-[2rem]">
                              {member.bio || "Member of The Noders Community"}
                            </p>

                            <div className="grid grid-cols-3 gap-2 mb-3">
                              <div className="rounded-lg border border-dark-border/70 bg-dark-bg/45 p-1.5 text-center">
                                <div className="text-sm font-bold text-text-primary tabular-nums">{totalPoints}</div>
                                <div className="text-[10px] uppercase tracking-wide text-text-secondary/90">Points</div>
                              </div>
                              <div className="rounded-lg border border-dark-border/70 bg-dark-bg/45 p-1.5 text-center">
                                <div className="text-sm font-bold text-text-primary tabular-nums">{certCount}</div>
                                <div className="text-[10px] uppercase tracking-wide text-text-secondary/90">Certs</div>
                              </div>
                              <div className="rounded-lg border border-dark-border/70 bg-dark-bg/45 p-1.5 text-center">
                                <div className="text-sm font-bold text-text-primary tabular-nums">{taskCount}</div>
                                <div className="text-[10px] uppercase tracking-wide text-text-secondary/90 flex items-center justify-center gap-1">
                                  <ClipboardList className="w-3 h-3" /> Tasks
                                </div>
                              </div>
                            </div>

                            <div className="space-y-1.5 text-xs text-text-secondary">
                              <div className="flex items-center gap-1.5 leading-none">
                                <Calendar className="w-3.5 h-3.5 text-text-secondary/80 flex-shrink-0" />
                                <span>Joined {joinDate}</span>
                              </div>
                              <div className="flex items-center gap-1.5 leading-none">
                                <FileText className="w-3.5 h-3.5 text-text-secondary/80 flex-shrink-0" />
                                <span>
                                  {postCount} {postCount === 1 ? 'post' : 'posts'}
                                  {totalViews > 0 && (
                                    <> • {totalViews.toLocaleString()} views</>
                                  )}
                                </span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    </div>
                  );
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
                Follow our community's fanpage to keep up with the newest recruitment information
              </p>
              <a href="https://www.facebook.com/thenodersptnk" target="_blank" rel="noopener noreferrer">
                <Button size="lg">Our Fanpage</Button>
              </a>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
