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
import { Search, Users, Mail, Facebook, Award, Check } from "lucide-react";


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
                  // Use CSS Avatar component instead of external image
                  const socialLinks = member.social_links || {};
                  const projectCount = member.contributed_projects?.length || 0;
                  console.log(members);

                  return (
                    <Link key={member.id} href={`/members/${member.username}`}>
                      <div className="group h-full">
                        <div className={`relative h-full rounded-2xl overflow-hidden transition-all duration-500 hover:-translate-y-2 ${
                          member.role === "admin"
                            ? "bg-gradient-to-br from-primary-blue/10 via-dark-surface to-accent-cyan/10 border-2 border-primary-blue/30 hover:border-primary-blue/60 hover:shadow-2xl hover:shadow-primary-blue/30"
                            : "bg-gradient-to-br from-dark-surface to-dark-surface/50 border border-dark-border hover:border-primary-blue/40 hover:shadow-xl hover:shadow-primary-blue/20"
                        }`}>
                          {/* Gradient overlay top */}
                          {member.role === "admin" && (
                            <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-primary-blue/20 to-transparent pointer-events-none" />
                          )}

                          {/* Decorative corner */}
                          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-primary-blue/10 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                          <div className="relative p-6 text-center">
                            {/* Avatar with glow */}
                            <div className="relative mx-auto mb-4 flex justify-center">
                              <div className={`${member.role === "admin" ? "ring-4 ring-primary-blue/30 rounded-full animate-pulse" : ""}`}>
                                <Avatar
                                  name={member.full_name}
                                  src={member.avatar_url}
                                  size="xl"
                                />
                              </div>
                              {member.role === "admin" && (
                                <div className="absolute -top-2 -right-2 w-10 h-10 bg-gradient-to-br from-primary-blue to-accent-cyan rounded-full flex items-center justify-center shadow-lg shadow-primary-blue/50 ring-2 ring-dark-surface">
                                  <Award className="w-6 h-6 text-white" />
                                </div>
                              )}
                            </div>

                            {/* Name and Username */}
                            <h3 className="text-xl font-bold text-text-primary mb-1 group-hover:text-primary-blue transition-colors">
                              {member.full_name || member.username}
                            </h3>
                            <p className="text-text-tertiary text-sm mb-3 font-mono">
                              @{member.username}
                            </p>

                            {/* Role Badge - Enhanced */}
                            <div className="mb-4">
                              <Badge
                                variant={member.role === "admin" ? "primary" : "secondary"}
                                size="sm"
                                className={member.role === "admin" ? "shadow-lg shadow-primary-blue/30 font-semibold" : ""}
                              >
                                {member.role === "admin" ? "👑 Admin" : "Member"}
                              </Badge>
                            </div>

                            {/* Bio */}
                            {member.bio && (
                              <p className="text-text-secondary text-sm mb-6 line-clamp-2 leading-relaxed">
                                {member.bio}
                              </p>
                            )}

                            {/* Stats Grid - Enhanced với icons */}
                            <div className="mb-6 grid grid-cols-2 gap-4">
                              <div className="relative bg-dark-bg/50 rounded-xl p-4 group-hover:bg-primary-blue/5 transition-colors duration-300">
                                <div className="absolute top-2 right-2 opacity-20">
                                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                                  </svg>
                                </div>
                                <div className="text-2xl font-bold text-primary-blue mb-1">
                                  {projectCount}
                                </div>
                                <div className="text-xs text-text-tertiary font-medium uppercase tracking-wide">
                                  Projects
                                </div>
                              </div>
                              <div className="relative bg-dark-bg/50 rounded-xl p-4 group-hover:bg-accent-cyan/5 transition-colors duration-300">
                                <div className="absolute top-2 right-2 opacity-20">
                                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M2 5a2 2 0 012-2h8a2 2 0 012 2v10a2 2 0 002 2H4a2 2 0 01-2-2V5zm3 1h6v4H5V6zm6 6H5v2h6v-2z" clipRule="evenodd" />
                                    <path d="M15 7h1a2 2 0 012 2v5.5a1.5 1.5 0 01-3 0V7z" />
                                  </svg>
                                </div>
                                <div className="text-2xl font-bold text-accent-cyan mb-1">
                                  {(member as any).posts_count || 0}
                                </div>
                                <div className="text-xs text-text-tertiary font-medium uppercase tracking-wide">
                                  Posts
                                </div>
                              </div>
                            </div>

                            {/* Contact Links - Enhanced */}
                            <div className="flex justify-center space-x-3 pt-4 border-t border-dark-border/50">
                              {member.email && (
                                <div className="relative group/email">
                                  <button
                                    onClick={(e) => handleCopyEmail(member.email, e)}
                                    className="flex items-center justify-center w-10 h-10 rounded-lg bg-dark-bg/50 text-text-tertiary hover:text-primary-blue hover:bg-primary-blue/10 transition-all duration-200 hover:scale-110"
                                    title={copiedEmail === member.email ? "Copied!" : "Click to copy email"}
                                  >
                                    {copiedEmail === member.email ? (
                                      <Check className="w-5 h-5 text-success" />
                                    ) : (
                                      <Mail className="w-5 h-5" />
                                    )}
                                  </button>
                                  {/* Tooltip */}
                                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-dark-surface border border-dark-border rounded-lg text-xs text-text-secondary whitespace-nowrap opacity-0 group-hover/email:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                                    {copiedEmail === member.email ? "Copied!" : member.email}
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px border-4 border-transparent border-t-dark-border" />
                                  </div>
                                </div>
                              )}
                              {socialLinks.facebook && (
                                <a
                                  href={socialLinks.facebook}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center justify-center w-10 h-10 rounded-lg bg-dark-bg/50 text-text-tertiary hover:text-primary-blue hover:bg-primary-blue/10 transition-all duration-200 hover:scale-110"
                                  onClick={(e) => e.stopPropagation()}
                                  title="Facebook Profile"
                                >
                                  <Facebook className="w-5 h-5" />
                                </a>
                              )}
                            </div>
                          </div>

                          {/* Hover gradient overlay */}
                          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary-blue/0 to-accent-cyan/0 group-hover:from-primary-blue/5 group-hover:to-accent-cyan/5 transition-all duration-500 pointer-events-none" />
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
