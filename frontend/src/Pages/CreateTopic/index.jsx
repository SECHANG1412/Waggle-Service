import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CATEGORIES } from '../../constants/categories';
import { CREATE_TOPIC_MESSAGES } from '../../constants/messages';
import { useTopic } from '../../hooks/useTopic';
import { showErrorAlert, showWarningAlert } from '../../utils/alertUtils';
import CategorySelect from './layout/CategorySelect';
import FormField from './layout/FormField';
import SubmitButton from './layout/SubmitButton';
import VoteOptionInputs from './layout/VoteOptionInputs';

const CreateTopic = () => {
  const { addTopic } = useTopic();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    vote_options: [''],
    category: '',
  });

  const onChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const onSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      const validVoteOptions = formData.vote_options.filter((opt) => opt.trim() !== '');

      if (new Set(validVoteOptions).size !== validVoteOptions.length) {
        showWarningAlert(
          CREATE_TOPIC_MESSAGES.duplicateOptionTitle,
          CREATE_TOPIC_MESSAGES.duplicateOptionText
        );
        return;
      }
      if (validVoteOptions.length < 2) {
        showWarningAlert(
          CREATE_TOPIC_MESSAGES.insufficientOptionsTitle,
          CREATE_TOPIC_MESSAGES.insufficientOptionsText
        );
        return;
      }

      try {
        const result = await addTopic({
          ...formData,
          vote_options: validVoteOptions,
        });
        if (!result) return;
        navigate(`/topic/${result.topic_id}`);
      } catch (error) {
        showErrorAlert(error, CREATE_TOPIC_MESSAGES.retry);
      }
    },
    [formData, addTopic, navigate]
  );

  const onOptionChange = useCallback((index, value) => {
    setFormData((prev) => {
      const updated = [...prev.vote_options];
      updated[index] = value;
      return { ...prev, vote_options: updated };
    });
  }, []);

  const onOptionAdd = useCallback(() => {
    if (formData.vote_options.length >= 4) {
      showWarningAlert(
        CREATE_TOPIC_MESSAGES.optionLimitTitle,
        CREATE_TOPIC_MESSAGES.optionLimitText
      );
      return;
    }
    setFormData((prev) => ({
      ...prev,
      vote_options: [...prev.vote_options, ''],
    }));
  }, [formData.vote_options]);

  const onOptionRemove = useCallback((index) => {
    setFormData((prev) => ({
      ...prev,
      vote_options: prev.vote_options.filter((_, i) => i !== index),
    }));
  }, []);

  return (
    <div className="flex items-center justify-center bg-slate-50 px-3 py-6 sm:px-4 sm:py-10">
      <div className="w-full max-w-3xl rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
        <h2 className="mb-5 text-xl font-semibold text-slate-900 sm:mb-6 sm:text-2xl">새 토픽 만들기</h2>
        <form onSubmit={onSubmit} className="space-y-5 sm:space-y-6">
          <FormField
            label="제목"
            name="title"
            value={formData.title}
            onChange={onChange}
            placeholder="토픽 제목을 입력해 주세요."
          />
          <FormField
            label="설명"
            name="description"
            value={formData.description}
            onChange={onChange}
            placeholder="토픽을 설명해 주세요."
          />
          <VoteOptionInputs
            formData={formData}
            onOptionAdd={onOptionAdd}
            onOptionRemove={onOptionRemove}
            onOptionChange={onOptionChange}
          />
          <CategorySelect categories={CATEGORIES} value={formData.category} onChange={onChange} />
          <SubmitButton label="토픽 만들기" />
        </form>
      </div>
    </div>
  );
};

export default CreateTopic;
