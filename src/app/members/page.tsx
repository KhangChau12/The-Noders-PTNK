"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useMembers } from "@/lib/hooks";
import { Card, CardContent } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { Loading, SkeletonProfile } from "@/components/Loading";
import { MemberFilters } from "@/types/member";
import { getInitials } from "@/lib/utils";
import { Avatar } from "@/components/Avatar";
import { ClickableBadge } from "@/components/ClickableBadge";
import { NeuralNetworkBackground } from "@/components/NeuralNetworkBackground";
import { Search, Users, Mail, Facebook, Award, Check, FileText } from "lucide-react";


export default function MembersPage() {
  const [filters, setFilters] = useState<MemberFilters>({
    role: "all",
    search: "",
    sort_by: "full_name",
    sort_order: "asc",
  });
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);

  const { members, loading, error } = useMembers(filters);

  const handleCopyEmail = async (email: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      await navigator.clipboard.writeText(email);
      setCopiedEmail(email);
      setTimeout(() => setCopiedEmail(null), 2000);
    } catch (err) {
      console.error('Failed to copy email:', err);
    }
  };

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
                    { label: "Admins", value: "admin" },
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
                  const socialLinks = member.social_links || {};
                  const projectCount = member.contributed_projects?.length || 0;
                  const postCount = (member as any).posts_count || 0;

                  return (
                    <div key={member.id} className="h-full">
                      <Link href={`/members/${member.username}`} className="h-full block">
                        <Card variant="interactive" className={`h-full group hover-lift relative overflow-hidden transition-all duration-300 border-dark-border ${member.role === 'admin' ? 'hover:border-primary-blue/60' : 'hover:border-text-secondary/40'}`}>
                          
                          {/* Admin Badge - Top Right */}
                          {member.role === "admin" && (
                            <div className="absolute top-3 right-3 z-10">
                              <Badge variant="primary" size="sm" className="shadow-lg shadow-primary-blue/20 backdrop-blur-md">
                                Admin
                              </Badge>
                            </div>
                          )}

                          <CardContent className="p-6 flex flex-col items-center text-center h-full">
                            {/* Avatar */}
                            <div className="mb-4 relative">
                              <div className={`transition-transform duration-300 group-hover:scale-105 ${member.role === 'admin' ? 'p-1 bg-gradient-to-br from-primary-blue to-accent-cyan rounded-full' : ''}`}>
                                <Avatar
                                  name={member.full_name}
                                  src={member.avatar_url}
                                  size="xl"
                                  className="border-4 border-dark-surface"
                                />
                              </div>
                            </div>

                            {/* Info */}
                            <div className="mb-4 w-full">
                              <h3 className="text-lg font-bold text-text-primary mb-1 group-hover:text-primary-blue transition-colors truncate px-2">
                                {member.full_name || member.username}
                              </h3>
                              <p className="text-sm text-text-tertiary font-mono">@{member.username}</p>
                            </div>

                            {/* Bio */}
                            <p className="text-sm text-text-secondary leading-relaxed mb-6 line-clamp-2 min-h-[2.5rem] w-full px-2">
                              {member.bio || "Member of The Noders PTNK"}
                            </p>

                            <div className="flex-1" />

                            {/* Stats Divider */}
                            <div className="w-full border-t border-dark-border/50 mb-4 group-hover:border-primary-blue/20 transition-colors"></div>

                            {/* Clear Stats Row */}
                            <div className="grid grid-cols-2 gap-4 w-full">
                              <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-dark-bg/30 group-hover:bg-primary-blue/5 transition-colors">
                                <span className="text-xl font-bold text-text-primary tabular-nums mb-1">{projectCount}</span>
                                <span className="text-xs text-text-tertiary font-medium uppercase tracking-wider flex items-center gap-1.5">
                                  <Users className="w-3 h-3" /> Projects
                                </span>
                              </div>
                              <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-dark-bg/30 group-hover:bg-accent-cyan/5 transition-colors">
                                <span className="text-xl font-bold text-text-primary tabular-nums mb-1">{postCount}</span>
                                <span className="text-xs text-text-tertiary font-medium uppercase tracking-wider flex items-center gap-1.5">
                                  <FileText className="w-3 h-3" /> Posts
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
                We're always looking for passionate individuals to join our AI
                community.
              </p>
              <Button size="lg">Learn How to Join</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
