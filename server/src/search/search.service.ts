// src/search/search.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, PipelineStage } from 'mongoose';

import { Event, EventDocument } from '../event/event.model';
import { Library, LibraryDocument } from '../library/models/library.model'; // Corrected path if needed
import { Post, PostDocument } from '../post/post.model';
import { User, UserDocument } from '../user/user.model';

export interface GlobalSearchResult {
  _id: string;
  type: 'User' | 'Event' | 'Post' | 'Library';
  title: string;
  description?: string;
  score: number;
  highlights?: any[];
}

@Injectable()
export class SearchService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(Event.name) private readonly eventModel: Model<EventDocument>,
    @InjectModel(Post.name) private readonly postModel: Model<PostDocument>,
    @InjectModel(Library.name)
    private readonly libraryModel: Model<LibraryDocument>,
  ) {}

  async globalSearch(
    searchTerm: string,
    page: number = 1,
    limit: number = 10,
    fuzzy: boolean = true,
  ): Promise<{ results: GlobalSearchResult[]; total: number }> {
    if (!searchTerm || searchTerm.trim() === '') {
      return { results: [], total: 0 };
    }

    const atlasSearchIndexName = 'default';

    // Define the base search options, excluding 'path' for now
    const baseSearchOptions = {
      index: atlasSearchIndexName,
      text: {
        query: searchTerm,
        fuzzy: fuzzy
          ? {
              maxEdits: 1,
              prefixLength: 2,
            }
          : undefined,
      },
      highlight: {
        // Still include highlights if you want them
        path: {
          wildcard: '*', // Can also be specified per collection if desired
        },
      },
    };

    // Projection stage (remains the same)
    const commonProjectStage = (
      type: GlobalSearchResult['type'],
    ): PipelineStage.Project => ({
      $project: {
        _id: '$_id',
        type: type,
        title: {
          $cond: {
            if: { $eq: [type, 'User'] },
            then: '$name',
            else: {
              $cond: {
                if: { $eq: [type, 'Event'] },
                then: '$title',
                else: {
                  $cond: {
                    if: { $eq: [type, 'Post'] },
                    then: '$title',
                    else: '$title',
                  },
                },
              },
            },
          },
        },
        description: {
          $cond: {
            if: { $eq: [type, 'User'] },
            then: '$email', // For users, using email as description
            else: {
              $cond: {
                if: { $eq: [type, 'Event'] },
                then: '$description',
                else: {
                  $cond: {
                    if: { $eq: [type, 'Post'] },
                    then: '$content',
                    else: '$description',
                  },
                },
              },
            },
          },
        },
        image: {
          $cond: {
            if: { $eq: [type, 'User'] },
            then: '$avatar',
            else: {
              $cond: {
                if: { $eq: [type, 'Event'] },
                then: '$imageUrl',
                else: {
                  $cond: {
                    if: { $eq: [type, 'Post'] },
                    then: '$bannerImage',
                    else: null,
                  },
                },
              },
            },
          },
        },
        score: { $meta: 'searchScore' },
        highlights: { $meta: 'searchHighlights' },
      },
    });

    // --- Sub-pipelines with specific 'path' definitions ---

    const userPipeline: PipelineStage[] = [
      {
        $search: {
          ...baseSearchOptions,
          text: {
            ...baseSearchOptions.text,
            path: ['name', 'email'], // <--- ONLY search name and email for Users
          },
          // Optionally, make highlights more specific here too
          highlight: { path: ['name', 'email'] },
        },
      },
      commonProjectStage('User'),
    ];

    const eventPipeline: PipelineStage[] = [
      {
        $search: {
          ...baseSearchOptions,
          text: {
            ...baseSearchOptions.text,
            path: ['title', 'description', 'location'], // Relevant fields for Event
          },
          highlight: { path: ['title', 'description', 'location'] },
        },
      },
      commonProjectStage('Event'),
    ];

    const postPipeline: PipelineStage[] = [
      {
        $search: {
          ...baseSearchOptions,
          text: {
            ...baseSearchOptions.text,
            path: ['title', 'content'], // Relevant fields for Post
          },
          highlight: { path: ['title', 'content'] },
        },
      },
      commonProjectStage('Post'),
    ];

    const libraryPipeline: PipelineStage[] = [
      {
        $search: {
          ...baseSearchOptions,
          text: {
            ...baseSearchOptions.text,
            path: ['title', 'description'], // Relevant fields for Library
          },
          highlight: { path: ['title', 'description'] },
        },
      },
      commonProjectStage('Library'),
    ];

    // Main aggregation pipeline using $unionWith (remains the same)
    const aggregationPipeline: PipelineStage[] = [
      ...userPipeline,
      {
        $unionWith: {
          coll: this.postModel.collection.name,
          pipeline: postPipeline as any,
        },
      },
      {
        $unionWith: {
          coll: this.eventModel.collection.name,
          pipeline: eventPipeline as any,
        },
      },
      {
        $unionWith: {
          coll: this.libraryModel.collection.name,
          pipeline: libraryPipeline as any,
        },
      },
      {
        $facet: {
          metadata: [{ $count: 'total' }],
          data: [{ $skip: (page - 1) * limit }, { $limit: limit }],
        },
      },
    ];

    const [results] = await this.userModel
      .aggregate(aggregationPipeline)
      .exec();

    const total = results.metadata[0]?.total ?? 0;
    const data: GlobalSearchResult[] = results.data.sort(
      (a, b) => b.score - a.score,
    );

    return { results: data, total: total };
  }
}
