import { CreateDocumentMenu } from '@/components/document/CreateDocumentMenu';
import { DocumentDeleteConfirm } from '@/components/document/DocumentDeleteConfirm';
import { SEO } from '@/components/shared/SEO';
import { Txt } from '@/components/shared/Txt';
import { Button } from '@/components/ui/button';
import useRouter from '@/hooks/useRouter';
import { useDeleteDocument } from '@/remotes/document/deleteDocument';
import { useGetDocuments } from '@/remotes/document/getDocuments';
import { useCategoryStore } from '@/stores/categoryStore';
import { formatDate } from '@/utils/formatDate';
import { MouseEventHandler } from 'react';

// access_token

export function MainPage() {
  const { push } = useRouter();
  const { selectedCategory } = useCategoryStore();
  const { mutate: deleteDocument } = useDeleteDocument();
  const { data } = useGetDocuments({ categoryId: selectedCategory?.id });

  const moveToDetail: MouseEventHandler<HTMLElement> = (e) => {
    const target = e.target as HTMLElement;
    const documentId = Number(target.id);

    if (target instanceof HTMLButtonElement) {
      return;
    } else {
      push(`/documents/${documentId}`);
    }
  };

  const hasNoContent = !data?.documents.length;

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
          {data?.documents.map((document) => (
            <article
              key={document.id}
              id={String(document.id)}
              className="cursor-pointer rounded-lg border-2 p-4 transition-all hover:bg-foreground/5"
              onClick={moveToDetail}
            >
              <div className="flex items-center justify-between">
                <Txt typography="large">{document.documentName}</Txt>
                <div className="flex items-center">
                  <Txt typography="small" className="text-foreground/40">
                    {formatDate(document.createdAt)}
                  </Txt>
                  <DocumentDeleteConfirm
                    trigger={
                      <Button variant="destructive" className="ml-3">
                        삭제
                      </Button>
                    }
                    deleteDocument={() => deleteDocument({ documentId: document.id })}
                  />
                </div>
              </div>
              {document.summary && (
                <Txt className="mt-[-20px] line-clamp-2 text-sm font-medium text-foreground/80">{document.summary}</Txt>
              )}
            </article>
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
