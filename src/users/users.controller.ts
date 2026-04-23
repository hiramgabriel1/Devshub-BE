import { Controller, Get, Param, Query, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import {
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TrendingBuildersBy, TrendingBuildersQueryDto } from './dto/trending-builders-query.dto';
import { UsersService } from './users.service';

type AuthRequest = Request & {
  user: {
    userId: string;
    email: string;
    username: string;
  };
};

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({ summary: 'Get my profile (private)' })
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({ description: 'Missing or invalid bearer token' })
  @ApiOkResponse({ description: 'Profile retrieved successfully' })
  @UseGuards(JwtAuthGuard)
  @Get('my-profile')
  getMyProfile(@Req() req: AuthRequest) {
    return this.usersService.getMyProfileWithBookmarks(req.user.userId);
  }

  // Backwards-compatible alias (can be removed later)
  @UseGuards(JwtAuthGuard)
  @Get('me')
  getMe(@Req() req: AuthRequest) {
    return this.usersService.getMyProfileWithBookmarks(req.user.userId);
  }

  @ApiOperation({ summary: 'Get trending builders by followers and/or post likes' })
  @ApiQuery({
    name: 'by',
    required: false,
    enum: TrendingBuildersBy,
    description: 'Ranking strategy: combined, followers, or likes',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Max number of users returned (1-100)',
  })
  @ApiOkResponse({
    description: 'Trending builders computed successfully',
    schema: {
      example: {
        by: 'combined',
        limit: 10,
        totalCandidates: 24,
        items: [
          {
            id: 'clx...',
            username: 'hiramdev',
            photoKey: 'users/clx/profile.png',
            position: 'Backend Engineer',
            description: 'Building APIs',
            followersCount: 120,
            likesReceivedCount: 430,
            score: 550,
          },
        ],
      },
    },
  })
  @Get('trending-builders')
  getTrendingBuilders(@Query() query: TrendingBuildersQueryDto) {
    return this.usersService.getTrendingBuilders(query);
  }

  @ApiOperation({ summary: 'Get a public profile by username' })
  @ApiOkResponse({ description: 'Profile retrieved successfully' })
  @ApiNotFoundResponse({ description: 'User not found' })
  @Get(':username')
  getByUsername(@Param('username') username: string) {
    return this.usersService.getProfileByUsername(username);
  }
}

