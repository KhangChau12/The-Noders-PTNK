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
import { Search, Users, Award, FileText, Calendar, GraduationCap } from "lucide-react";


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
              Get to know the passionate individuals behind The Noders PTNK. Our
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
              <p className="text-text-secondary">
                {members.length} member{members.length !== 1 ? "s" : ""} found
              </p>
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
                  const projectCount = member.contributed_projects?.length || 0;
                  const postCount = member.posts_count || 0;
                  const certCount = member.certificate_count || 0;
                  const totalViews = member.total_post_views || 0;
                  const contestCount = member.contest_count || 0;
                  const joinDate = new Date(member.created_at).toLocaleDateString('en-US', {
                    day: '2-digit', month: 'short', year: 'numeric'
                  });

                  return (
                    <div key={member.id}>
                      <Link href={`/members/${member.username}`} className="block">
                        <Card variant="interactive" className={`h-68 group hover-lift relative overflow-hidden transition-all duration-300 border-dark-border ${member.role === 'admin' ? 'hover:border-primary-blue/60' : 'hover:border-text-secondary/40'}`}>

                          {/* Admin Badge - Top Right */}
                          {member.role === "admin" && (
                            <div className="absolute top-3 right-3 z-10">
                              <Badge variant="primary" size="sm" className="shadow-lg shadow-primary-blue/20 backdrop-blur-md">
                                Core Team
                              </Badge>
                            </div>
                          )}

                          <CardContent className="p-5 flex gap-5 h-full">
                            {/* LEFT COLUMN: Avatar + Name + Role */}
                            <div className="flex flex-col items-center flex-shrink-0 w-32">
                              <div className={`transition-transform duration-300 group-hover:scale-105 mb-3 ${member.role === 'admin' ? 'p-1 bg-gradient-to-br from-primary-blue to-accent-cyan rounded-full' : ''}`}>
                                <Avatar
                                  name={member.full_name}
                                  src={member.avatar_url}
                                  size="2xl"
                                  className="border-4 border-dark-surface"
                                />
                              </div>
                              <h3 className="text-sm font-bold text-text-primary text-center leading-tight group-hover:text-primary-blue transition-colors line-clamp-2">
                                {member.full_name || member.username}
                              </h3>
                              <p className="text-xs text-text-tertiary mt-1 text-center line-clamp-2">
                                {member.bio || "Member of The Noders PTNK"}
                              </p>
                            </div>

                            {/* RIGHT COLUMN: Stats + Info */}
                            <div className="flex-1 flex flex-col justify-between min-w-0 pt-6">
                              {/* Joined date */}
                              <div className="flex items-center gap-1.5 text-xs text-text-tertiary">
                                <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
                                <span>Joined community since: {joinDate}</span>
                              </div>

                              {/* Stats boxes - 3 columns */}
                              <div className="grid grid-cols-3 gap-2">
                                <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-dark-bg/30 group-hover:bg-primary-blue/5 transition-colors">
                                  <span className="text-lg font-bold text-text-primary tabular-nums">{projectCount}</span>
                                  <span className="text-[10px] text-text-tertiary font-medium flex items-center gap-1">
                                    <Users className="w-3 h-3" /> Projects
                                  </span>
                                </div>
                                <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-dark-bg/30 group-hover:bg-accent-cyan/5 transition-colors">
                                  <span className="text-lg font-bold text-text-primary tabular-nums">{certCount}</span>
                                  <span className="text-[10px] text-text-tertiary font-medium flex items-center gap-1">
                                    <Award className="w-3 h-3" /> Certs
                                  </span>
                                </div>
                                <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-dark-bg/30 group-hover:bg-accent-purple/5 transition-colors">
                                  <span className="text-lg font-bold text-text-primary tabular-nums">{contestCount}</span>
                                  <span className="text-[10px] text-text-tertiary font-medium flex items-center gap-1">
                                    <GraduationCap className="w-3 h-3" /> Contests
                                  </span>
                                </div>
                              </div>

                              {/* Posts with views - bottom line */}
                              <div className="flex items-center gap-1.5 text-xs text-text-secondary">
                                <FileText className="w-3.5 h-3.5 text-text-tertiary flex-shrink-0" />
                                <span>
                                  Wrote <span className="font-semibold text-text-primary">{postCount}</span>{' '}
                                  {postCount === 1 ? 'post' : 'posts'}
                                  {totalViews > 0 && (
                                    <> with <span className="font-semibold text-text-primary">{totalViews.toLocaleString()}</span> views</>
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
