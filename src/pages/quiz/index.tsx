import { CreateDocumentDialog } from '@/components/FileUploadDialog';
import { DocumentLimitProtecter } from '@/components/DocumentLimitProtecter';
import { Center } from '@/components/Center';
import { SEO } from '@/components/SEO';
import { Txt } from '@/components/Txt';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import useRouter from '@/hooks/useRouter';
import { TodayQuestion } from '@/models/type';
import { useGetQuestionSetId } from '@/remotes/question/getQuesionSetId';
import { useTodayQuestion } from '@/remotes/question/getTodayQuestion';
import { useGetUserInfo } from '@/remotes/user/getUserInfo';
import { ReactNode } from 'react';
import { useParams } from 'react-router-dom';
import { useCategoryStore } from '@/stores/categoryStore';

export function QuizPage({ children }: { children: ReactNode }) {
  return children;
}

function Private() {
  const {
    data: { questionSetId, message },
  } = useGetQuestionSetId();
  const { data } = useTodayQuestion({ questionSetId });

  if (!questionSetId) {
    switch (message) {
      case 'QUESTION_SET_NOT_READY':
        return <NotGenerated />;
      case 'DOCUMENT_NOT_CREATED_YET':
        return <NoDocument />;
    }
  }

  if (!data) return null;
  return (
    <>
      <QuizComponent questions={data.questions} />
      <SEO title="Today Quiz" description="복습 창고" image="" />
    </>
  );
}

function Public() {
  const { questionSetId } = useParams();
  const { data } = useTodayQuestion({ questionSetId });

  if (!data) return null;
  return (
    <>
      <SEO title="Today Quiz" description="복습 창고" image="" />
      <QuizComponent questions={data.questions} />
    </>
  );
}

function QuizComponent({ questions }: { questions: TodayQuestion[] }) {
  const { push } = useRouter();

  return (
    <main className="flex w-full flex-col items-center justify-center">
      <Txt typography="h4" className="mt-8 w-full max-w-4xl p-3 text-center ring-1 ring-offset-2 ring-offset-cyan-300">
        오늘의 퀴즈가 도착했어요 🎉
      </Txt>
      <Accordion type="multiple" className="w-full max-w-4xl p-5 md:p-8 lg:p-12">
        {questions.map((question, index) => (
          <AccordionItem key={question.id} value={String(question.id)} className="last:border-none">
            <AccordionTrigger className="text-start">{`${index + 1}. ${question.question}`}</AccordionTrigger>
            <AccordionContent>
              <div>{question.answer}</div>
              <div className="mt-6 flex items-center justify-between">
                <Txt className="small">
                  {question.category.name} {'>'} {question.document.name}
                </Txt>
                <button className="p-2" onClick={() => push(`/documents/${question.document.id}`)}>
                  <span className="border-b border-foreground">문서보기</span>
                </button>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </main>
  );
}

function NoDocument() {
  const { push } = useRouter();
  const { selectedCategory } = useCategoryStore();

  return (
    <div className="flex flex-col items-center">
      <SEO title="Today Quiz" description="복습 창고" image="" />
      <Txt
        typography="h4"
        className="mt-8 w-full max-w-4xl p-3 text-center ring-1 ring-offset-2 ring-offset-foreground"
      >
        문서를 생성해주세요
      </Txt>
      <Center className="flex w-full flex-col items-center p-4">
        <Txt typography="small" className="text-center leading-5 text-foreground/60">
          아직 생성된 문서가 없어요
          <br />
          문서를 생성하고 매일 새로운 퀴즈를 받아보세요!
        </Txt>
        <div className="mt-4 flex w-full max-w-sm flex-col space-y-3">
          {!selectedCategory?.id ? (
            <>
              <Button
                className="bg-red-300 shadow-md hover:bg-red-400"
                onClick={() => toast({ title: '문서에서 카테고리를 먼저 생성해주세요' })}
              >
                md 파일 업로드하기
              </Button>
              <Button
                className="bg-blue-400 shadow-md hover:bg-blue-500"
                onClick={() => toast({ title: '문서에서 카테고리를 먼저 생성해주세요' })}
              >
                직접 문서 작성하기
              </Button>
            </>
          ) : (
            <>
              <DocumentLimitProtecter
                fakeTrigger={<Button className="bg-red-300 shadow-md hover:bg-red-400">md 파일 업로드하기</Button>}
              >
                <CreateDocumentDialog
                  type="file"
                  trigger={<Button className="bg-red-300 shadow-md hover:bg-red-400">md 파일 업로드하기</Button>}
                />
              </DocumentLimitProtecter>
              <DocumentLimitProtecter
                fakeTrigger={<Button className="bg-blue-400 shadow-md hover:bg-blue-500">직접 문서 작성하기</Button>}
              >
                <Button className="bg-blue-400 shadow-md hover:bg-blue-500" onClick={() => push('/write')}>
                  직접 문서 작성하기
                </Button>
              </DocumentLimitProtecter>
            </>
          )}
        </div>
      </Center>
    </div>
  );
}

function NotGenerated() {
  const { push } = useRouter();
  const { data: user } = useGetUserInfo();

  if (!user) return null;
  return (
    <div className="flex flex-col items-center">
      <SEO title="Today Quiz" description="복습 창고" image="" />
      <Txt
        typography="h4"
        className="mt-8 w-full max-w-4xl p-3 text-center ring-1 ring-offset-2 ring-offset-foreground"
      >
        아직 오늘의 퀴즈가 생성되지 않았어요
      </Txt>
      <Center className="flex w-full flex-col items-center p-4">
        <Txt typography="small" className="text-center leading-5 text-foreground/60">
          문서가 생성되면 {user.email}으로 알림을 보내드릴게요!
        </Txt>
        <div className="mt-4 flex w-full max-w-sm flex-col space-y-3">
          <Button className="bg-blue-400 shadow-md hover:bg-blue-500" onClick={() => push('/')}>
            문서 창고로 이동하기
          </Button>
        </div>
      </Center>
    </div>
  );
}

QuizPage.Private = Private;
QuizPage.Public = Public;
