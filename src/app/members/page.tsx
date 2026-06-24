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
import { PageHero } from "@/components/PageHero";
import { Search, FileText, Calendar } from "lucide-react";


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
      <div className="relative min-h-screen z-10">
        <PageHero
          title="Meet Our Team"
          subtitle="The People Behind The Noders"
          description="Get to know the passionate individuals building, writing, and competing across The Noders Community."
        />

        <section className="pb-12 px-4 sm:px-6 lg:px-8">
          <div className="container mx-auto">
          {/* Controls — search + role filter on one baseline row */}
          <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="w-full sm:w-72">
              <Input
                placeholder="Search members..."
                value={filters.search || ""}
                onChange={(e) => handleSearchChange(e.target.value)}
                icon={<Search className="w-4 h-4" />}
              />
            </div>

            <div className="flex items-center gap-2">
              {[
                { label: "All", value: "all" },
                { label: "Members", value: "member" },
                { label: "Core Team", value: "admin" },
              ].map((option) => (
                <ClickableBadge
                  key={option.value}
                  variant={filters.role === option.value ? "primary" : "secondary"}
                  size="md"
                  className="hover:opacity-80"
                  onClick={() => handleRoleFilter(option.value)}
                >
                  {option.label}
                </ClickableBadge>
              ))}
            </div>
          </div>

          {/* Results count */}
          {!loading && members && (
            <div className="mb-6 text-sm text-text-tertiary">
              {members.length} member{members.length !== 1 ? "s" : ""} found
            </div>
          )}

          {/* Members grid */}
          <div className="mb-12">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 sm:gap-6">
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
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 sm:gap-6">
                {members.map((member) => {
                  const totalPoints = member.total_points || 0;
                  const postCount = member.posts_count || 0;
                  const certCount = member.certificate_count || 0;
                  const totalViews = member.total_post_views || 0;
                  const taskCount = member.task_count || 0;
                  const isCore = member.role === "admin";
                  const joinDate = new Date(member.created_at).toLocaleDateString("en-US", {
                    day: "2-digit", month: "short", year: "numeric",
                  });

                  return (
                    <Link key={member.id} href={`/members/${member.id}`} className="block group h-full">
                      <div
                        className={`relative h-full flex flex-col overflow-hidden rounded-2xl border bg-dark-surface/70 backdrop-blur-sm p-5 sm:p-6 transition-all duration-300 hover:shadow-lg hover:shadow-primary-blue/10 sm:group-hover:-translate-y-1 ${
                          isCore
                            ? "border-primary-blue/40 hover:border-primary-blue/60"
                            : "border-dark-border/60 hover:border-primary-blue/40"
                        }`}
                      >
                        {/* Identity */}
                        <div className="flex items-start justify-between gap-3 mb-4">
                          <div className="flex items-center gap-3 min-w-0">
                            <Avatar
                              name={member.full_name}
                              src={member.avatar_url}
                              size="lg"
                              className="border-2 border-dark-surface flex-shrink-0"
                            />
                            <div className="min-w-0">
                              <h3 className="text-base font-bold text-text-primary truncate group-hover:text-primary-blue transition-colors duration-300">
                                {member.full_name || member.username}
                              </h3>
                              <p className="text-xs text-text-secondary truncate">@{member.username}</p>
                            </div>
                          </div>

                          {isCore && (
                            <Badge variant="primary" size="sm" className="flex-shrink-0">
                              Core Team
                            </Badge>
                          )}
                        </div>

                        {/* Bio */}
                        <p className="text-sm text-text-secondary leading-relaxed line-clamp-2 mb-4 min-h-[2.5rem]">
                          {member.bio || "Member of The Noders Community"}
                        </p>

                        {/* Stats — light pills, homepage style */}
                        <div className="grid grid-cols-3 gap-2 mb-4">
                          {[
                            { value: totalPoints, label: "Points" },
                            { value: certCount, label: "Certs" },
                            { value: taskCount, label: "Tasks" },
                          ].map((stat) => (
                            <div
                              key={stat.label}
                              className="rounded-lg border border-dark-border/50 bg-dark-bg/40 px-2 py-2 text-center"
                            >
                              <div className="text-sm font-bold text-text-primary tabular-nums">{stat.value}</div>
                              <div className="text-[10px] uppercase tracking-wide text-text-tertiary">{stat.label}</div>
                            </div>
                          ))}
                        </div>

                        {/* Footer meta */}
                        <div className="mt-auto pt-4 border-t border-dark-border/60 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-text-tertiary">
                          <span className="inline-flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
                            Joined {joinDate}
                          </span>
                          <span className="inline-flex items-center gap-1.5">
                            <FileText className="w-3.5 h-3.5 flex-shrink-0" />
                            {postCount} {postCount === 1 ? "post" : "posts"}
                            {totalViews > 0 && <> • {totalViews.toLocaleString()} views</>}
                          </span>
                        </div>
                      </div>
                    </Link>
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
          <div className="relative overflow-hidden rounded-2xl border border-dark-border/60 bg-dark-surface/70 backdrop-blur-sm p-8 text-center">
            <h2 className="text-2xl font-bold text-text-primary mb-3">
              Interested in Joining?
            </h2>
            <p className="text-text-secondary mb-6 max-w-xl mx-auto">
              Follow our community's fanpage to keep up with the newest recruitment information.
            </p>
            <a href="https://www.facebook.com/thenodersptnk" target="_blank" rel="noopener noreferrer">
              <Button size="lg">Our Fanpage</Button>
            </a>
          </div>
          </div>
        </section>
      </div>
    </>
  );
}
