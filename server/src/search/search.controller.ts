import {
  Controller,
  DefaultValuePipe,
  Get,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GlobalSearchResult, SearchService } from './search.service';

@ApiTags('Search')
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get('global')
  @ApiOperation({
    summary:
      'Perform a global search across Users, Events, Posts, and Libraries',
  })
  @ApiQuery({
    name: 'q',
    description: 'The search query string',
    type: String,
    required: true,
  })
  @ApiQuery({
    name: 'page',
    description: 'Page number (default: 1)',
    type: Number,
    required: false,
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    description: 'Items per page (default: 10)',
    type: Number,
    required: false,
    example: 10,
  })
  @ApiQuery({
    name: 'fuzzy',
    description:
      'Enable/disable fuzzy matching (typo tolerance, default: true)',
    type: Boolean,
    required: false,
    example: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved search results.',
    type: Object, // You might define a specific DTO for the response here
    isArray: false,
    schema: {
      properties: {
        query: { type: 'string' },
        page: { type: 'number' },
        limit: { type: 'number' },
        total: { type: 'number' },
        results: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              _id: { type: 'string' },
              type: {
                type: 'string',
                enum: ['User', 'Event', 'Post', 'Library'],
              },
              title: { type: 'string' },
              description: { type: 'string' },
              score: { type: 'number' },
              highlights: { type: 'array', items: { type: 'object' } }, // More detailed schema if needed
              originalDoc: { type: 'object' }, // More detailed schema if needed
            },
          },
        },
      },
    },
  })
  async globalSearch(
    @Query('q') query: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    // Convert 'true'/'false' string from query param to boolean
    @Query('fuzzy', new DefaultValuePipe('true')) fuzzy: string,
  ): Promise<{
    results: GlobalSearchResult[];
    total: number;
    page: number;
    limit: number;
    query: string;
  }> {
    const enableFuzzy = fuzzy.toLowerCase() === 'true'; // Case-insensitive conversion
    const { results, total } = await this.searchService.globalSearch(
      query,
      page,
      limit,
      enableFuzzy,
    );
    return { results, total, page, limit, query };
  }
}
