import { Link } from 'react-router-dom';

const Admin = () => {
  return (
    <section className="mx-auto max-w-5xl px-4 py-10">
      <div className="mb-8">
        <p className="text-sm font-semibold text-blue-600">관리자</p>
        <h1 className="mt-3 text-3xl font-bold text-slate-900">운영 관리</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          문의 처리, 콘텐츠 숨김, 관리자 조치 이력을 관리하기 위한 운영 화면입니다.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <section className="rounded-lg border border-slate-200 bg-white p-5">
          <h2 className="text-base font-semibold text-slate-900">문의 관리</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            접수된 문의를 확인하고 처리 상태를 관리합니다.
          </p>
          <Link
            to="/admin/inquiries"
            className="mt-4 inline-flex rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            문의 관리로 이동
          </Link>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-5">
          <h2 className="text-base font-semibold text-slate-900">콘텐츠 관리</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            부적절한 토픽과 댓글을 삭제하지 않고 숨김 처리합니다.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              to="/admin/topics"
              className="inline-flex rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              토픽 관리
            </Link>
            <Link
              to="/admin/comments"
              className="inline-flex rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              댓글 관리
            </Link>
          </div>
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
