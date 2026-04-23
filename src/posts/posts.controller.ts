import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post as HttpPost,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreatePostDto } from './dto/create-post.dto';
import { PostsService } from './posts.service';

type AuthRequest = Request & {
  user: {
    userId: string;
    email: string;
    username: string;
  };
};

@ApiTags('Posts')
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @ApiOperation({ summary: 'Create a new post' })
  @ApiBearerAuth()
  @ApiBody({ type: CreatePostDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid bearer token' })
  @ApiCreatedResponse({ description: 'Post created successfully' })
  @UseGuards(JwtAuthGuard)
  @HttpPost()
  create(@Req() req: AuthRequest, @Body() dto: CreatePostDto) {
    return this.postsService.create(req.user.userId, dto);
  }

  @ApiOperation({ summary: 'List published posts' })
  @ApiOkResponse({ description: 'Posts retrieved successfully' })
  @Get()
  findAll() {
    return this.postsService.findAll();
  }

  @ApiOperation({ summary: 'List my bookmarked posts' })
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({ description: 'Missing or invalid bearer token' })
  @ApiOkResponse({ description: 'Bookmarks retrieved successfully' })
  @UseGuards(JwtAuthGuard)
  @Get('bookmarks/me')
  findMyBookmarks(@Req() req: AuthRequest) {
    return this.postsService.findMyBookmarks(req.user.userId);
  }

  @ApiOperation({ summary: 'Save a post to my bookmarks' })
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({ description: 'Missing or invalid bearer token' })
  @ApiNotFoundResponse({ description: 'Post not found' })
  @ApiCreatedResponse({
    description: 'Post bookmarked successfully',
    schema: { example: { bookmarked: true } },
  })
  @UseGuards(JwtAuthGuard)
  @HttpPost(':postId/bookmark')
  bookmarkPost(@Req() req: AuthRequest, @Param('postId') postId: string) {
    return this.postsService.bookmarkPost(req.user.userId, postId);
  }

  @ApiOperation({ summary: 'Remove a post from my bookmarks' })
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({ description: 'Missing or invalid bearer token' })
  @ApiNotFoundResponse({ description: 'Post not found' })
  @ApiOkResponse({
    description: 'Bookmark removed successfully',
    schema: { example: { bookmarked: false } },
  })
  @UseGuards(JwtAuthGuard)
  @Delete(':postId/bookmark')
  removeBookmark(@Req() req: AuthRequest, @Param('postId') postId: string) {
    return this.postsService.removeBookmark(req.user.userId, postId);
  }

  @ApiOperation({ summary: 'Get a post by id' })
  @ApiOkResponse({ description: 'Post retrieved successfully' })
  @ApiNotFoundResponse({ description: 'Post not found' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.postsService.findOne(id);
  }
}

