import React, { useCallback, useState } from 'react';
import { useTopic } from '../../hooks/useTopic';
import { useNavigate } from 'react-router-dom';
import FormField from './layout/FormField';
import VoteOptionInputs from './layout/VoteOptionInputs';
import CategorySelect from './layout/CategorySelect';
import SubmitButton from './layout/SubmitButton';
import { CATEGORIES } from '../../constants/categories';
import { showErrorAlert, showWarningAlert } from '../../utils/alertUtils';

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
        showWarningAlert('중복된 투표 옵션', '서로 다른 옵션을 입력해 주세요.');
        return;
      }
      if (validVoteOptions.length < 2) {
        showWarningAlert('투표 옵션 부족', '최소 2개 이상의 옵션이 필요해요.');
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
        showErrorAlert(error, '다시 시도해 주세요.');
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
      showWarningAlert('옵션 개수 초과', '투표 옵션은 최대 4개까지 가능합니다.');
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
    <div className="flex items-center justify-center px-4 py-10 bg-slate-50">
      <div className="max-w-3xl w-full bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
        <h2 className="text-2xl font-semibold text-slate-900 mb-6">새로운 토픽 만들기</h2>
        <form onSubmit={onSubmit} className="space-y-6">
          <FormField
            label="제목"
            name="title"
            value={formData.title}
            onChange={onChange}
            placeholder="토픽 제목을 입력하세요"
          />
          <FormField
            label="설명"
            name="description"
            value={formData.description}
            onChange={onChange}
            placeholder="토픽을 설명해주세요"
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
