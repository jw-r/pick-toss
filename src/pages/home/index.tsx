import { CreateDocumentMenu } from '@/pages/home/components/CreateDocumentMenu';
import { DocumentDeleteConfirm } from '@/pages/home/components/DocumentDeleteConfirm';
import { SEO } from '@/components/SEO';
import { Txt } from '@/components/Txt';
import { Button } from '@/components/ui/button';
import useRouter from '@/hooks/useRouter';
import { useDeleteDocument } from '@/remotes/document/deleteDocument';
import { useGetDocuments } from '@/remotes/document/getDocuments';
import { formatDate } from '@/utils/formatDate';
import { MouseEventHandler } from 'react';
import { useCategoryStore } from '@/stores/categoryStore';
import { PuffLoader } from 'react-spinners';
import usePolling from '@/hooks/usePolling';

export function MainPage() {
  const { push } = useRouter();
  const { selectedCategory } = useCategoryStore();
  const { mutate: deleteDocument } = useDeleteDocument();
  const { data: documents, refetch: refetchDocuments } = useGetDocuments({ categoryId: selectedCategory?.id });

  usePolling({
    callback: refetchDocuments,
    condition: !!documents && (documents?.filter((document) => document.status === 'UNPROCESSED').length || 0) > 0,
    interval: 3000,
  });

  const moveToDetail: MouseEventHandler<HTMLElement> = (e) => {
    const currentTarget = e.currentTarget as HTMLElement;
    const documentId = Number(currentTarget.id);

    push(`/documents/${documentId}`);
  };

  const hasNoContent = !documents?.length;

  return (
    <div className="flex w-full max-w-[880px] flex-col p-4 md:p-8 lg:p-12">
      <main className="flex w-full flex-col">
        <SEO title="Documents" description="모든 문서" image="" />
        <div className="flex flex-col">
          <div className="mb-4 flex justify-between">
            <Txt className="border-none text-4xl font-extrabold">📄 문서</Txt>
            <CreateDocumentMenu />
          </div>
          <Txt typography="small" className="text-foreground/60">
            문서가 많을수록 오늘의 퀴즈가 다채로워져요!
          </Txt>
        </div>
        <div className="mt-8 space-y-4">
          {documents?.map((document) => (
            <div key={document.id} className="relative">
              <article
                key={document.id}
                id={String(document.id)}
                className="relative flex cursor-pointer flex-col rounded-lg border-2 p-4 transition-all hover:bg-foreground/5"
                onClick={moveToDetail}
              >
                <div className="table w-full table-fixed">
                  <div className="flex justify-between">
                    <Txt typography="large" className="overflow-hidden overflow-ellipsis whitespace-nowrap">
                      {document.documentName}
                    </Txt>
                    <div className="flex items-center pr-8">
                      <Txt typography="small" className="whitespace-nowrap text-foreground/40">
                        {formatDate(document.createdAt)}
                      </Txt>
                    </div>
                  </div>
                </div>
                <div className="mt-4">
                  {document.status === 'PROCESSED' ? (
                    <Txt className="line-clamp-2 text-sm font-medium text-foreground/80">{document.summary}</Txt>
                  ) : (
                    <div className="flex w-full items-center">
                      <PuffLoader size={20} />
                      <Txt className="ml-1 text-sm font-medium text-foreground/80">문서를 요약중이예요</Txt>
                    </div>
                  )}
                </div>
              </article>
              <DocumentDeleteConfirm
                trigger={
                  <Button variant="ghost" className="absolute right-3 top-3 px-2 text-red-500 hover:text-red-600">
                    삭제
                  </Button>
                }
                deleteDocument={() => deleteDocument({ documentId: document.id })}
              />
            </div>
          ))}
        </div>
        {hasNoContent && (
          <div className="mt-24 flex w-full flex-col items-center justify-center space-y-2 font-semibold text-foreground/50">
            <Txt>생성된 문서가 없어요</Txt>
            <Txt>문서를 업로드하시면 매일 새로운 퀴즈를 생성해서 알림을 보내드릴게요 🚀</Txt>
          </div>
        )}
      </main>
    </div>
  );
}
