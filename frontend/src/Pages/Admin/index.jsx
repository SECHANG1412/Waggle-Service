const Admin = () => {
  return (
    <section className="mx-auto max-w-5xl px-4 py-10">
      <div className="mb-8">
        <p className="text-sm font-semibold text-blue-600">관리자</p>
        <h1 className="mt-3 text-3xl font-bold text-slate-900">운영 관리</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          문의, 콘텐츠 숨김, 사용자 제재 이력을 관리하기 위한 관리자 화면입니다.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <section className="rounded-lg border border-slate-200 bg-white p-5">
          <h2 className="text-base font-semibold text-slate-900">문의 관리</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            접수된 문의를 확인하고 처리 상태를 관리합니다.
          </p>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-5">
          <h2 className="text-base font-semibold text-slate-900">콘텐츠 관리</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            부적절한 토픽과 댓글을 삭제하지 않고 숨김 처리합니다.
          </p>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-5">
          <h2 className="text-base font-semibold text-slate-900">감사 로그</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            관리자 조치의 사유와 변경 이력을 추적합니다.
          </p>
        </section>
      </div>
    </section>
  );
};

export default Admin;
