import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { FormEventHandler, ReactNode, useEffect, useState } from 'react';
import { useCreateDocument } from '@/remotes/document/createDocument';
import { DialogTrigger } from '@radix-ui/react-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Txt } from '@/components/Txt';
import { useGetDocument } from '@/remotes/document/getDocument';
import useRouter from '@/hooks/useRouter';
import FadeLoader from 'react-spinners/FadeLoader';
import { useGetUserInfo } from '@/remotes/user/getUserInfo';
import { toast } from '@/components/ui/use-toast';
import { MAX_CONTENT_LENGTH, MIN_CONTENT_LENGTH } from '@/constants';
import { useCategoryStore } from '@/stores/categoryStore';
import delay from '@/utils/delay';
import { useQueryClient } from '@tanstack/react-query';
import { useGetCategories } from '@/remotes/category/getCategories';
import useManagedCategorySelection from '@/hooks/useManagedCategorySelection';

export function CreateDocumentDialog({
  type,
  content,
  trigger,
}: { type: 'file'; content?: never; trigger?: ReactNode } | { type: 'content'; content: string; trigger?: ReactNode }) {
  const queryClient = useQueryClient();
  const { selectedCategory } = useCategoryStore();
  const { mutate: createDocument } = useCreateDocument();

  const [uploadProcess, setUploadProcess] = useState<'NOT_START' | 'PROGRESSING' | 'DONE'>('NOT_START');
  const [documentId, setDocumentId] = useState<number | undefined>();

  const onSubmit: FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    setUploadProcess('PROGRESSING');

    const formData = new FormData(e.currentTarget);
    let file;
    let categoryId: number;
    const userDocumentName = formData.get('userDocumentName') as string;

    if (type === 'file') {
      file = formData.get('file') as File;

      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        const contentLength = String(e.target?.result).length;

        if (contentLength < MIN_CONTENT_LENGTH || contentLength >= MAX_CONTENT_LENGTH) {
          toast({
            title: `문서를 생성하지 못했어요. 현재 파일의 글자 수 : ${contentLength}`,
            description: `문서를 생성하기 위해서 300글자 이상 15,000글자 이하의 텍스트가 포함된 파일이여야 해요 😭`,
          });

          setUploadProcess('NOT_START');
        }
      };
      reader.readAsText(file);

      categoryId = Number(selectedCategory?.id);
    } else {
      const blob = new Blob([content], { type: 'text/markdown' });
      file = new File([blob], `${Date.now()}.md`, { type: blob.type });
      categoryId = Number(formData.get('category'));
    }

    if (file.type !== 'text/markdown' && !file.name.endsWith('.md')) {
      alert('마크다운 문서를 업로드해주세요');
      return;
    }

    createDocument(
      {
        file,
        userDocumentName,
        categoryId,
        documentFormat: 'MARKDOWN',
      },
      {
        onSuccess: ({ id }) => {
          setDocumentId(id);
        },
      },
    );
  };

  const ProcessContent = () => {
    switch (uploadProcess) {
      case 'NOT_START':
        if (type === 'file') {
          return <FileUpload onSubmit={onSubmit} />;
        } else {
          return <Write onSubmit={onSubmit} />;
        }
      case 'PROGRESSING':
        return (
          <Progressing
            next={async () => {
              setUploadProcess('DONE');
              await queryClient.refetchQueries();
            }}
          />
        );
      case 'DONE':
        return <Done documentId={documentId} />;
    }
  };

  useManagedCategorySelection();

  return (
    <Dialog
      open={uploadProcess === 'PROGRESSING' ? true : undefined}
      onOpenChange={() => {
        setDocumentId(undefined);
        setUploadProcess('NOT_START');
      }}
    >
      <DialogTrigger asChild>
        {trigger ? (
          trigger
        ) : (
          <Button variant="ghost" className="h-full">
            {type === 'file' ? 'md 파일 업로드' : '직접 작성하기'}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="min-h-[322px]">
        <ProcessContent />
      </DialogContent>
    </Dialog>
  );
}

function FileUpload({ onSubmit }: { onSubmit: FormEventHandler<HTMLFormElement> }) {
  return (
    <>
      <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
        <X className="h-4 w-4" />
      </DialogClose>
      <DialogHeader>
        <DialogTitle className="text-center">문서 업로드</DialogTitle>
        <DialogDescription className="text-center">
          MARKDOWN 문서를 업로드하면 질문을 생성해서 매일 알림을 보내드려요!
          <br /> 학습 창고에서 등록한 모든 문서와 질문을 확인할 수 있어요
        </DialogDescription>
      </DialogHeader>
      <form className="flex flex-col justify-end" onSubmit={onSubmit}>
        <TooltipProvider>
          <Tooltip open>
            <TooltipTrigger asChild>
              <Input
                type="file"
                name="file"
                className="mt-8 hover:bg-foreground/10"
                accept=".md"
                placeholder=".md 확장자 파일을 업로드해주세요"
                required
              />
            </TooltipTrigger>
            <TooltipContent>
              <p>
                <strong>.md 확장자</strong> 파일을 업로드해주세요!
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <Input name="userDocumentName" placeholder="문서 이름을 작성해주세요!" className="mt-2" required />
        <Button className="mt-6">문서 등록하고 질문 받아보기</Button>
      </form>
    </>
  );
}

function Write({ onSubmit }: { onSubmit: FormEventHandler<HTMLFormElement> }) {
  const { data: categories } = useGetCategories();
  const { selectedCategory } = useCategoryStore();

  return (
    <>
      <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
        <X className="h-4 w-4" />
      </DialogClose>
      <DialogHeader>
        <DialogTitle className="text-center">문서 업로드</DialogTitle>
        <DialogDescription className="text-center">
          매일 질문을 생성해서 매일 알림을 보내드려요!
          <br /> 학습 창고에서 등록한 모든 문서와 질문을 확인할 수 있어요
        </DialogDescription>
      </DialogHeader>
      <form className="flex flex-col justify-end" onSubmit={onSubmit}>
        <Input name="userDocumentName" placeholder="문서 이름을 작성해주세요!" required />
        <div className="mt-4 flex items-center justify-between">
          <Txt typography="small">카테고리를 선택해주세요</Txt>
          <Select name="category" defaultValue={String(selectedCategory?.id)}>
            <SelectTrigger className="w-[180px] focus:ring-0">
              <SelectValue placeholder={selectedCategory?.name} />
            </SelectTrigger>
            <SelectContent>
              {categories?.map((category) => (
                <SelectItem key={category.id} value={String(category.id)}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button className="mt-10">문서 등록하고 질문 받아보기</Button>
      </form>
    </>
  );
}

function Progressing({ next }: { next: () => void }) {
  useEffect(() => {
    const progress = async () => {
      await delay(2000);
      next();
    };

    progress();
  }, [next]);

  return (
    <DialogHeader>
      <DialogTitle className="text-center">문서를 생성중이에요!</DialogTitle>
      <DialogDescription className="text-center">퀴즈가 생성될 때까지는 최대 1분이 소요될 수 있어요</DialogDescription>
      <div className="flex justify-center pt-12">
        <FadeLoader color="#36d7b7" />
      </div>
    </DialogHeader>
  );
}

function Done({ documentId }: { documentId: number | undefined }) {
  const { push } = useRouter();
  const { data } = useGetDocument({ documentId });
  const { data: user } = useGetUserInfo();

  const isPro = user?.subscription.plan === 'PRO';

  if (!data || !user) return <></>;
  return (
    <div className="flex flex-col justify-between space-y-2">
      <div>
        <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
          <X className="h-4 w-4" />
        </DialogClose>
        <DialogHeader>
          <DialogTitle className="text-center">문서 생성을 완료했어요 🎉</DialogTitle>
        </DialogHeader>
        <Txt typography="line-code" className="mt-4 block w-full py-2 text-center">
          💡 퀴즈 생성이 완료될 때까지는 최대 1분이 소요될 수 있습니다
        </Txt>
        <div className="mt-4 space-y-1">
          <div className="font-semibold">
            <span className="inline-block w-20">문서 제목:</span>
            <span className="w-full text-center">{data?.documentName}</span>
          </div>

          <div className="text-sm text-foreground/50">
            <span className="inline-block w-20">카테고리:</span>
            <span className="w-full text-center">{data?.category.name}</span>
          </div>
        </div>
      </div>
      <div className="space-y-2">
        <div className="text-end">
          <Txt typography="small">
            현재 보유 문서 수: {user.documentUsage.currentPossessDocumentNum} / 최대 보유 문서 수:{' '}
            {isPro ? user.documentUsage.proPlanMaxPossessDocumentNum : user.documentUsage.freePlanMaxPossessDocumentNum}
          </Txt>
        </div>
        <DialogClose asChild>
          <div className="flex justify-between space-x-4">
            <Button onClick={() => push('/')} className="w-full">
              문서창고 바로가기
            </Button>
            <Button onClick={() => push('/repository')} className="w-full">
              복습창고 바로가기
            </Button>
          </div>
        </DialogClose>
      </div>
    </div>
  );
}
