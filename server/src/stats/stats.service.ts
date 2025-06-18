import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../user/user.model';
import { Post, PostDocument } from '../post/post.model';
import { Event, EventDocument } from '../event/event.model';
import { Library, LibraryDocument } from '../library/models/library.model';
import {
  Permission,
  PermissionDocument,
} from '../library/models/permission.model';
import { RecentRecordsDto } from './dto/recent-records.dto';
import { MonthlyStatsDto } from './dto/monthly-stats.dto';
import { CombinedStatsDto } from './dto/combined-stats.dto';

@Injectable()
export class StatsService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
    @InjectModel(Event.name) private eventModel: Model<EventDocument>,
    @InjectModel(Library.name) private libraryModel: Model<LibraryDocument>,
    @InjectModel(Permission.name)
    private permissionModel: Model<PermissionDocument>,
  ) {}

  async getRecentRecords(): Promise<RecentRecordsDto> {
    const [users, posts, events, permissions] = await Promise.all([
      this.userModel
        .find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select('name email avatar role status createdAt updatedAt')
        .exec(),
      this.postModel
        .find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('createdBy', 'name email avatar')
        .exec(),
      this.eventModel
        .find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('createdBy', 'name email avatar')
        .exec(),
      this.permissionModel
        .find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('user', 'name email avatar')
        .populate('grantedBy', 'name email avatar')
        .populate('library', 'title description')
        .exec(),
    ]);

    return {
      users,
      posts,
      events,
      permissions,
    };
  }

  async getMonthlyStats(): Promise<MonthlyStatsDto> {
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const currentMonthEnd = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59,
      999,
    );

    const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevMonthEnd = new Date(
      now.getFullYear(),
      now.getMonth(),
      0,
      23,
      59,
      59,
      999,
    );

    // Get current month counts
    const [
      currentUserCount,
      currentPostCount,
      currentEventCount,
      currentLibraryCount,
    ] = await Promise.all([
      this.userModel.countDocuments({
        createdAt: { $gte: currentMonthStart, $lte: currentMonthEnd },
      }),
      this.postModel.countDocuments({
        createdAt: { $gte: currentMonthStart, $lte: currentMonthEnd },
      }),
      this.eventModel.countDocuments({
        createdAt: { $gte: currentMonthStart, $lte: currentMonthEnd },
      }),
      this.libraryModel.countDocuments({
        createdAt: { $gte: currentMonthStart, $lte: currentMonthEnd },
      }),
    ]);

    // Get previous month counts
    const [prevUserCount, prevPostCount, prevEventCount, prevLibraryCount] =
      await Promise.all([
        this.userModel.countDocuments({
          createdAt: { $gte: prevMonthStart, $lte: prevMonthEnd },
        }),
        this.postModel.countDocuments({
          createdAt: { $gte: prevMonthStart, $lte: prevMonthEnd },
        }),
        this.eventModel.countDocuments({
          createdAt: { $gte: prevMonthStart, $lte: prevMonthEnd },
        }),
        this.libraryModel.countDocuments({
          createdAt: { $gte: prevMonthStart, $lte: prevMonthEnd },
        }),
      ]);

    // Get total counts (all time)
    const [totalUserCount, totalPostCount, totalEventCount, totalLibraryCount] =
      await Promise.all([
        this.userModel.countDocuments({}),
        this.postModel.countDocuments({}),
        this.eventModel.countDocuments({}),
        this.libraryModel.countDocuments({}),
      ]);

    // Calculate ratios
    const calculateRatio = (current: number, previous: number): string => {
      if (previous === 0) {
        return current > 0 ? '100%' : '0%';
      }
      const ratio = ((current - previous) / previous) * 100;
      return `${ratio > 0 ? '+' : ''}${ratio.toFixed(1)}%`;
    };

    return {
      User: {
        currentMonth: currentUserCount,
        prevMonth: prevUserCount,
        ratio: calculateRatio(currentUserCount, prevUserCount),
        total: totalUserCount,
      },
      Post: {
        currentMonth: currentPostCount,
        prevMonth: prevPostCount,
        ratio: calculateRatio(currentPostCount, prevPostCount),
        total: totalPostCount,
      },
      Event: {
        currentMonth: currentEventCount,
        prevMonth: prevEventCount,
        ratio: calculateRatio(currentEventCount, prevEventCount),
        total: totalEventCount,
      },
      Library: {
        currentMonth: currentLibraryCount,
        prevMonth: prevLibraryCount,
        ratio: calculateRatio(currentLibraryCount, prevLibraryCount),
        total: totalLibraryCount,
      },
    };
  }

  async getCombinedStats(): Promise<CombinedStatsDto> {
    const [recentRecords, monthlyStats] = await Promise.all([
      this.getRecentRecords(),
      this.getMonthlyStats(),
    ]);

    return {
      recentRecords,
      monthlyStats,
    };
  }
}
