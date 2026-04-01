import { useCallback } from "react";
import api from "../utils/api";
import { useAuth } from "./useAuth";
import {
  handleAuthError,
  showErrorAlert,
  showLoginRequiredAlert,
  showSuccessAlert,
} from "../utils/alertUtils";
import { parseApiDate } from "../utils/date";

const getIntervalForTimeRange = (timeRange) => {
  switch (timeRange) {
    case "1H":
    case "6H":
      return "1m";
    case "1D":
      return "5m";
    case "1W":
      return "30m";
    case "1M":
      return "3h";
    case "ALL":
      return "12h";
    default:
      return "1m";
  }
};

const getFormattedTime = (date, timeRange) => {
  const MM = String(date.getMonth() + 1).padStart(2, "0");
  const DD = String(date.getDate()).padStart(2, "0");
  const HH = String(date.getHours()).padStart(2, "0");
  const mm = String(date.getMinutes()).padStart(2, "0");

  if (timeRange === "1H" || timeRange === "6H" || timeRange === "1D") {
    return `${HH}:${mm}`;
  }

  if (timeRange === "1W") {
    return `${MM}/${DD} ${HH}:${mm}`;
  }

  return `${MM}/${DD}`;
};

export const useVote = () => {
  const { isAuthenticated, isAuthLoading } = useAuth();

  const submitVote = useCallback(
    async ({ topicId, voteIndex }) => {
      if (!isAuthLoading && !isAuthenticated) {
        await showLoginRequiredAlert();
        return false;
      }

      try {
        const response = await api.post("/votes", {
          topic_id: topicId,
          vote_index: voteIndex,
        });

        if (response.status === 200) {
          showSuccessAlert("?Ñ‹ëª´åª›Â€ ?ê¾¨ì¦º?ì„ë¿€?ë“¬ë•²??");
          return response.data;
        }
        return null;
      } catch (error) {
        if (error.response?.status === 403) {
          showErrorAlert(error, "?ëŒ€? ?Ñ‹ëª´???ì¢ëµ¿?ë‚…ë•²??");
          return false;
        }
        if (await handleAuthError(error)) return false;
        showErrorAlert(error, "?Ñ‹ëª´ç‘œ?ï§£ì„Žâ”?ì„? ï§ì‚µë»½?ë“¬ë•²??");
        return false;
      }
    },
    [isAuthenticated, isAuthLoading]
  );

  const getTopicVotes = useCallback(async (topicId, timeRange = "ALL") => {
    try {
      const convertedTimeRange = timeRange === "1M" ? "30d" : timeRange;
      const isAllTime = convertedTimeRange === "ALL";

      const params = {
        interval: getIntervalForTimeRange(timeRange),
        time_range: isAllTime ? "all" : convertedTimeRange.toLowerCase(),
      };
      const response = await api.get(`/votes/topic/${topicId}`, { params });

      if (response.status === 200) {
        return Object.entries(response.data).map(([timeStamp, voteData]) => {
          const date = parseApiDate(timeStamp);
          return {
            timestamp: timeStamp,
            label: getFormattedTime(date, timeRange),
            ...Object.entries(voteData).reduce(
              (acc, [key, value]) =>
                typeof value === "object"
                  ? {
                      ...acc,
                      [`count_${key}`]: value.count || 0,
                      [`percent_${key}`]: value.percent || 0,
                    }
                  : acc,
              {}
            ),
          };
        });
      }
      return null;
    } catch (error) {
      showErrorAlert(error, "?Ñ‹ëª´ ?ë“¦í€Žç‘œ?éºëˆìœ­?ã…¼? ï§ì‚µë»½?ë“¬ë•²??");
      return null;
    }
  }, []);

  return {
    submitVote,
    getTopicVotes,
  };
};
