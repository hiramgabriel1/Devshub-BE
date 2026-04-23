import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';

@Injectable()
export class PostsService {
  constructor(private readonly prisma: PrismaService) {}

  create(authorId: string, dto: CreatePostDto) {
    return this.prisma.post.create({
      data: {
        authorId,
        title: dto.title,
        description: dto.description,
        media: dto.media ?? [],
        website: dto.website,
        tags: dto.tags ?? [],
        isDraft: dto.isDraft ?? false,
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            photoKey: true,
          },
        },
      },
    });
  }

  findAll() {
    return this.prisma.post.findMany({
      where: { isDraft: false },
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            photoKey: true,
          },
        },
        _count: {
          select: {
            likes: true,
            bookmarks: true,
          },
        },
      },
    });
  }

  findMyBookmarks(userId: string) {
    return this.prisma.bookmark.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        post: {
          include: {
            author: {
              select: {
                id: true,
                username: true,
                photoKey: true,
              },
            },
            _count: {
              select: {
                likes: true,
                bookmarks: true,
              },
            },
          },
        },
      },
    });
  }

  async findOne(id: string) {
    const post = await this.prisma.post.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            photoKey: true,
          },
        },
        _count: {
          select: {
            likes: true,
            bookmarks: true,
          },
        },
      },
    });

    if (!post) throw new NotFoundException('Post not found');

    return post;
  }
}

