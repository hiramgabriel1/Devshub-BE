import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TrendingBuildersBy, TrendingBuildersQueryDto } from './dto/trending-builders-query.dto';

type TrendingBuilder = {
  id: string;
  username: string;
  photoKey: string | null;
  position: string | null;
  description: string | null;
  followersCount: number;
  likesReceivedCount: number;
  score: number;
};

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getMyProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        photoKey: true,
        position: true,
        description: true,
        techStack: true,
        socialLinks: true,
        websiteUrl: true,
        isVerified: true,
        createdAt: true,
        _count: {
          select: {
            followers: true,
            following: true,
            posts: true,
          },
        },
      },
    });

    if (!user) throw new NotFoundException('User not found');

    return user;
  }

  async getMyProfileWithBookmarks(userId: string) {
    const profile = await this.getMyProfile(userId);

    const bookmarks = await this.prisma.bookmark.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 25,
      select: {
        createdAt: true,
        post: {
          include: {
            author: {
              select: { id: true, username: true, photoKey: true },
            },
            _count: {
              select: { likes: true, bookmarks: true },
            },
          },
        },
      },
    });

    return {
      ...profile,
      bookmarks,
    };
  }

  async getProfileByUsername(username: string) {
    const user = await this.prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        photoKey: true,
        position: true,
        description: true,
        techStack: true,
        socialLinks: true,
        websiteUrl: true,
        createdAt: true,
        _count: {
          select: {
            followers: true,
            following: true,
            posts: true,
          },
        },
      },
    });

    if (!user) throw new NotFoundException('User not found');

    return user;
  }

  async getTrendingBuilders(query: TrendingBuildersQueryDto) {
    const by = query.by ?? TrendingBuildersBy.COMBINED;
    const limit = query.limit ?? 10;

    const users = await this.prisma.user.findMany({
      where: { isActive: true },
      select: {
        id: true,
        username: true,
        photoKey: true,
        position: true,
        description: true,
        _count: {
          select: {
            followers: true,
          },
        },
      },
    });

    const postLikes = await this.prisma.post.findMany({
      where: { isDraft: false },
      select: {
        authorId: true,
        _count: {
          select: {
            likes: true,
          },
        },
      },
    });

    const likesByAuthor = postLikes.reduce<Record<string, number>>((acc, post) => {
      acc[post.authorId] = (acc[post.authorId] ?? 0) + post._count.likes;
      return acc;
    }, {});

    const builders: TrendingBuilder[] = users.map((user) => {
      const followersCount = user._count.followers;
      const likesReceivedCount = likesByAuthor[user.id] ?? 0;
      const score =
        by === TrendingBuildersBy.FOLLOWERS
          ? followersCount
          : by === TrendingBuildersBy.LIKES
            ? likesReceivedCount
            : followersCount + likesReceivedCount;

      return {
        id: user.id,
        username: user.username,
        photoKey: user.photoKey,
        position: user.position,
        description: user.description,
        followersCount,
        likesReceivedCount,
        score,
      };
    });

    const trending = builders
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        if (b.followersCount !== a.followersCount) return b.followersCount - a.followersCount;
        return b.likesReceivedCount - a.likesReceivedCount;
      })
      .slice(0, limit);

    return {
      by,
      limit,
      totalCandidates: builders.length,
      items: trending,
    };
  }
}

