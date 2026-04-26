import { useCallback, useState } from 'react';
import { TOPIC_MESSAGES } from '../constants/messages';
import api from '../utils/api';
import { handleAuthError, showErrorAlert, showSuccessAlert } from '../utils/alertUtils';

export const useTopic = () => {
  const [loading, setLoading] = useState(false);

  const fetchTopics = useCallback(async ({ sort, limit, offset, category, search }) => {
    setLoading(true);
    try {
      const params = {
        sort,
        limit,
        offset,
        category,
        ...(search && { search }),
      };
      const response = await api.get('/topics', {
        params,
      });

      if (response.status === 200) {
        return response.data;
      }
      return null;
    } catch (error) {
      showErrorAlert(error, TOPIC_MESSAGES.fetchFailed);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const pinTopic = useCallback(async (topicId) => {
    try {
      const response = await api.post(`/topics/${topicId}/pin`);
      return response.status === 200;
    } catch (error) {
      if (await handleAuthError(error)) return false;
      showErrorAlert(error, TOPIC_MESSAGES.pinFailed);
      return false;
    }
  }, []);

  const unpinTopic = useCallback(async (topicId) => {
    try {
      const response = await api.delete(`/topics/${topicId}/pin`);
      return response.status === 200;
    } catch (error) {
      if (await handleAuthError(error)) return false;
      showErrorAlert(error, TOPIC_MESSAGES.unpinFailed);
      return false;
    }
  }, []);

  const countAllTopics = useCallback(async (category, search) => {
    setLoading(true);
    try {
      const params = {
        category,
        ...(search && { search }),
      };
      const response = await api.get('/topics/count', {
        params,
      });

      if (response.status === 200) {
        return response.data;
      }
      return null;
    } catch (error) {
      showErrorAlert(error, TOPIC_MESSAGES.countFailed);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const addTopic = useCallback(async (topicData) => {
    setLoading(true);
    try {
      const response = await api.post('/topics', topicData);

      if (response.status === 200) {
        showSuccessAlert(TOPIC_MESSAGES.createSuccess);
        return response.data;
      }
      return null;
    } catch (error) {
      if (await handleAuthError(error)) return null;
      showErrorAlert(error, TOPIC_MESSAGES.createFailed);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getTopicById = useCallback(async (topicId) => {
    setLoading(true);
    try {
      const response = await api.get(`/topics/${topicId}`);

      if (response.status === 200) {
        return response.data;
      }
      return null;
    } catch (error) {
      if (error.response?.status === 404) return null;
      if (await handleAuthError(error)) return undefined;
      showErrorAlert(error, TOPIC_MESSAGES.detailFetchFailed);
      return undefined;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteTopic = useCallback(async (topicId) => {
    setLoading(true);
    try {
      const response = await api.delete(`/topics/${topicId}`);
      if (response.status === 200) {
        showSuccessAlert(TOPIC_MESSAGES.deleteSuccess);
        return true;
      }
      return false;
    } catch (error) {
      if (await handleAuthError(error)) return false;
      showErrorAlert(error, TOPIC_MESSAGES.deleteFailed);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    fetchTopics,
    countAllTopics,
    addTopic,
    getTopicById,
    deleteTopic,
    pinTopic,
    unpinTopic,
  };
};
