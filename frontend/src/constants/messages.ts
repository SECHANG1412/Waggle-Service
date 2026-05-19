export const COMMON_MESSAGES = {
  confirm: '확인',
  cancel: '취소',
  delete: '삭제',
  success: '성공',
  apiError: 'API 오류',
  defaultError: '요청 처리 중 오류가 발생했습니다.',
};

export const AUTH_MESSAGES = {
  loginRequiredTitle: '로그인이 필요합니다',
  loginRequiredText: '서비스 이용을 위해 먼저 로그인해 주세요.',
  loginRequiredFeature: '로그인이 필요한 기능입니다.',
  loginRequiredAfterLogin: '로그인 후 이용할 수 있습니다.',
  sessionExpired: '세션이 만료되었습니다. 다시 로그인해 주세요.',
  loginFailed: '로그인에 실패했습니다.',
  invalidEmail: '올바른 이메일 주소를 입력해 주세요.',
  invalidUsername: '닉네임은 2자 이상이어야 합니다.',
  invalidPassword: '비밀번호는 6자 이상이어야 합니다.',
  passwordMismatch: '비밀번호가 일치하지 않습니다.',
  signupFailed: '회원가입에 실패했습니다.',
  logoutFailed: '로그아웃 실패:',
};

export const TOPIC_MESSAGES = {
  fetchFailed: '토픽 목록을 불러오지 못했습니다.',
  pinFailed: '토픽을 고정하지 못했습니다.',
  unpinFailed: '토픽 고정을 해제하지 못했습니다.',
  countFailed: '토픽 수를 불러오지 못했습니다.',
  createSuccess: '토픽이 등록되었습니다.',
  createFailed: '토픽을 등록하지 못했습니다.',
  detailFetchFailed: '토픽 정보를 불러오지 못했습니다.',
  deleteSuccess: '토픽이 삭제되었습니다.',
  deleteFailed: '토픽을 삭제하지 못했습니다.',
  deleteConfirmTitle: '토픽을 삭제하시겠습니까?',
  deleteConfirmText: '삭제한 토픽은 복구할 수 없습니다.',
  notFound: '존재하지 않는 토픽입니다.',
  loadError: '토픽을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.',
};

export const COMMENT_MESSAGES = {
  createSuccess: '댓글이 등록되었습니다.',
  createFailed: '댓글을 등록하지 못했습니다.',
  fetchFailed: '댓글을 불러오지 못했습니다.',
  deleteSuccess: '댓글이 삭제되었습니다.',
  deleteFailed: '댓글을 삭제하지 못했습니다.',
  updateSuccess: '댓글이 수정되었습니다.',
  updateFailed: '댓글을 수정하지 못했습니다.',
  deleteConfirmTitle: '댓글을 삭제하시겠습니까?',
  deleteConfirmText: '삭제하면 되돌릴 수 없습니다.',
  loginRequiredCreate: '댓글을 작성하려면 로그인해 주세요.',
  loginRequiredEdit: '댓글을 수정하려면 로그인해 주세요.',
  loginRequiredDelete: '댓글을 삭제하려면 로그인해 주세요.',
  loginRequiredLike: '댓글에 좋아요를 누르려면 로그인해 주세요.',
};

export const REPLY_MESSAGES = {
  createFailed: '답글을 등록하지 못했습니다.',
  deleteFailed: '답글을 삭제하지 못했습니다.',
  updateFailed: '답글을 수정하지 못했습니다.',
  deleteConfirmTitle: '답글을 삭제하시겠습니까?',
  deleteConfirmText: '삭제한 답글은 복구할 수 없습니다.',
  loginRequiredCreate: '답글을 작성하려면 로그인해 주세요.',
  loginRequiredEdit: '답글을 수정하려면 로그인해 주세요.',
  loginRequiredDelete: '답글을 삭제하려면 로그인해 주세요.',
  loginRequiredLike: '답글에 좋아요를 누르려면 로그인해 주세요.',
};

export const LIKE_MESSAGES = {
  toggleFailed: '좋아요 처리에 실패했습니다.',
};

export const VOTE_MESSAGES = {
  submitSuccess: '투표가 완료되었습니다.',
  alreadyVoted: '이미 투표한 토픽입니다.',
  submitFailed: '투표를 처리하지 못했습니다.',
  statsFetchFailed: '투표 통계를 불러오지 못했습니다.',
};

export const CREATE_TOPIC_MESSAGES = {
  duplicateOptionTitle: '중복된 투표 옵션',
  duplicateOptionText: '서로 다른 옵션을 입력해 주세요.',
  insufficientOptionsTitle: '투표 옵션 부족',
  insufficientOptionsText: '최소 2개 이상의 옵션이 필요합니다.',
  optionLimitTitle: '옵션 개수 초과',
  optionLimitText: '투표 옵션은 최대 4개까지 가능합니다.',
  retry: '다시 시도해 주세요.',
};

export const PROFILE_MESSAGES = {
  loginRequired: '로그인이 필요합니다.',
  fetchFailed: '프로필 정보를 불러오지 못했습니다.',
  statsFetchFailed: '통계 정보를 불러오지 못했습니다.',
  activityFetchFailed: '최근 활동을 불러오지 못했습니다.',
  nameRequired: '이름을 입력해 주세요.',
  updateSuccess: '프로필이 수정되었습니다.',
  updateFailed: '프로필 수정에 실패했습니다.',
};
