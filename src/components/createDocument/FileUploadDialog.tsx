import { X } from 'lucide-react';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { Input } from '../ui/input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { FormEventHandler } from 'react';
import { useCreateDocument } from '@/remotes/document/createDocument';
import { useCategoryStore } from '@/stores/categoryStore';

export function FileUploadDialog() {
  const { selectedCategory } = useCategoryStore();
  const { mutate: createDocument } = useCreateDocument();

  const onSubmit: FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const file = formData.get('file') as File;
    const userDocumentName = formData.get('userDocumentName') as string;

    createDocument({
      file,
      userDocumentName,
      categoryId: Number(selectedCategory?.id),
      documentFormat: 'MARKDOWN',
    });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">문서 업로드하기</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
          <X className="h-4 w-4" />
        </DialogClose>
        <DialogHeader>
          <DialogTitle className="text-center">문서 업로드</DialogTitle>
          <DialogDescription>
            MARKDOWN 문서를 업로드하면 질문을 생성해서 매일 알림을 보내드려요!
            <br /> 학습 창고에서 등록한 모든 문서와 질문을 확인할 수 있어요
          </DialogDescription>
        </DialogHeader>
        <form className="flex min-h-48 flex-col justify-end" onSubmit={onSubmit}>
          <TooltipProvider>
            <Tooltip open>
              <TooltipTrigger asChild>
                <Input
                  type="file"
                  name="file"
                  className="mt-8 hover:bg-foreground/10"
                  accept=".md"
                  placeholder=".md 확장자 파일을 업로드해주세요"
                />
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  <strong>.md 확장자</strong> 파일을 업로드해주세요!
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <Input name="userDocumentName" placeholder="문서 이름을 작성해주세요!" className="mt-2" />
          <Button className="mt-6">문서 등록하고 질문 받아보기</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}