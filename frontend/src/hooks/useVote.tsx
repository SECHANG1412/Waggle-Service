import { isAxiosError } from 'axios';
import { useCallback } from 'react';
import { VOTE_MESSAGES } from '../constants/messages';
import type { VoteChartPoint, VoteCreateRequest, VoteRead, VoteStatsResponse } from '../types';
import api from '../utils/api';
import { parseApiDate } from '../utils/date';
import { useAuth } from './auth-context';
import {
  handleAuthError,
  showErrorAlert,
  showLoginRequiredAlert,
  showSuccessAlert,
} from '../utils/alertUtils';

type TopicId = number | string;

type TimeRange = '1H' | '6H' | '1D' | '1W' | '1M' | 'ALL' | string;

type SubmitVoteParams = {
  topicId: TopicId;
  voteIndex: number;
};

const getIntervalForTimeRange = (timeRange: TimeRange) => {
  switch (timeRange) {
    case '1H':
    case '6H':
      return '1m';
    case '1D':
      return '5m';
    case '1W':
      return '30m';
    case '1M':
      return '3h';
    case 'ALL':
      return '12h';
    default:
      return '1m';
  }
};

const getFormattedTime = (date: Date, timeRange: TimeRange) => {
  const MM = String(date.getMonth() + 1).padStart(2, '0');
  const DD = String(date.getDate()).padStart(2, '0');
  const HH = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');

  if (timeRange === '1H' || timeRange === '6H' || timeRange === '1D') {
    return `${HH}:${mm}`;
  }

  if (timeRange === '1W') {
    return `${MM}/${DD} ${HH}:${mm}`;
  }

  return `${MM}/${DD}`;
};

export const useVote = () => {
  const { isAuthenticated, isAuthLoading } = useAuth();

  const submitVote = useCallback(
    async ({ topicId, voteIndex }: SubmitVoteParams) => {
      if (!isAuthLoading && !isAuthenticated) {
        await showLoginRequiredAlert();
        return false;
      }

      try {
        const payload: VoteCreateRequest = {
          topic_id: Number(topicId),
          vote_index: voteIndex,
        };
        const response = await api.post<VoteRead>('/votes', payload);

        if (response.status === 200) {
          showSuccessAlert(VOTE_MESSAGES.submitSuccess);
          return response.data;
        }
        return null;
      } catch (error) {
        if (isAxiosError(error) && error.response?.status === 403) {
          showErrorAlert(error, VOTE_MESSAGES.alreadyVoted);
          return false;
        }
        if (await handleAuthError(error)) return false;
        showErrorAlert(error, VOTE_MESSAGES.submitFailed);
        return false;
      }
    },
    [isAuthenticated, isAuthLoading]
  );

  const getTopicVotes = useCallback(async (topicId: TopicId, timeRange: TimeRange = 'ALL') => {
    try {
      const convertedTimeRange = timeRange === '1M' ? '30d' : timeRange;
      const isAllTime = convertedTimeRange === 'ALL';

      const params = {
        interval: getIntervalForTimeRange(timeRange),
        time_range: isAllTime ? 'all' : convertedTimeRange.toLowerCase(),
      };
      const response = await api.get<VoteStatsResponse>(`/votes/topic/${topicId}`, { params });

      if (response.status === 200) {
        return Object.entries(response.data).map(([timeStamp, voteData]) => {
          const date = parseApiDate(timeStamp);
          const label = date && !Number.isNaN(date.getTime()) ? getFormattedTime(date, timeRange) : '';

          return {
            timestamp: timeStamp,
            label,
            ...Object.entries(voteData).reduce(
              (acc, [key, value]) =>
                typeof value === 'object' && value !== null
                  ? {
                      ...acc,
                      [`count_${key}`]: value.count || 0,
                      [`percent_${key}`]: value.percent || 0,
                    }
                  : acc,
              {}
            ),
          } as VoteChartPoint;
        });
      }
      return null;
    } catch (error) {
      showErrorAlert(error, VOTE_MESSAGES.statsFetchFailed);
      return null;
    }
  }, []);

  return {
    submitVote,
    getTopicVotes,
  };
};
