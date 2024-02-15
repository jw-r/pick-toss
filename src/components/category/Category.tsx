/* eslint-disable react-refresh/only-export-components */
import { ChangeEvent, FormEventHandler, MouseEventHandler, useEffect, useState } from 'react';
import { Txt } from '../shared/Txt';
import { Button } from '../ui/button';
import { Plus } from 'lucide-react';
import { useCategoryStore } from '@/stores/categoryStore';
import { useGetCategories } from '@/remotes/category/getCategories';
import { useCreateCategory } from '@/remotes/category/createCategory';
import { Input } from '../ui/input';
import { useDeleteCategory } from '@/remotes/category/deleteCategory';
import { MoreVertical } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { FolderOpen } from 'lucide-react';
import { CategoryDeleteConfirm } from './CategoryDeleteConfirm';
import { toast } from '../ui/use-toast';

function Category() {
  const { data } = useGetCategories();
  const { selectedCategory, selectCategory } = useCategoryStore();
  const { mutate: createCategory } = useCreateCategory();
  const { mutate: deleteCategory } = useDeleteCategory();

  const [hoverCategoryId, setHoverCategoryId] = useState<number | null>();
  const [isInputOpen, setIsInputOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');

  const handleClickCategory: MouseEventHandler<HTMLButtonElement> = (e) => {
    const target = e.target as HTMLButtonElement;

    if (target.id && target.name) {
      selectCategory({ id: Number(target.id), name: target.name });
    }
  };

  const onSubmitCategoryInput: FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();

    handleCreateCategory(inputValue);
  };

  const isExistCategory = (categoryName: string) => {
    return data.categories.filter((category) => category.name === categoryName).length > 0;
  };

  const handleCreateCategory = (categoryName: string) => {
    setIsInputOpen(false);
    setInputValue('');

    if (isExistCategory(categoryName)) {
      toast({
        title: '이미 존재하는 카테고리입니다',
      });
      return;
    }

    if (categoryName.replace(/\s+/g, '') === '') {
      return;
    }

    createCategory(
      { name: categoryName.trim() },
      {
        onSuccess: ({ id }) => {
          selectCategory({ id, name: categoryName });
        },
      },
    );
  };

  const handleDeleteCategory = (categoryId: number) => {
    deleteCategory(
      { categoryId },
      {
        onSuccess: () => {
          if (categoryId === selectedCategory?.id) {
            selectCategory(data.categories[0]);
          }
        },
      },
    );
  };

  useEffect(() => {
    selectCategory(data?.categories[0]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (data.categories.length === 0) {
      selectCategory(null);
    }
  }, [data.categories.length, selectCategory]);

  return (
    <>
      <div className="hidden space-y-6 p-4 sm:block md:p-8 lg:py-12">
        <div className="w-36 lg:w-52">
          <Txt typography="h3">카테고리</Txt>
          <div className="h-[2px] w-full bg-foreground" />
        </div>
        <div className="flex w-36 flex-col space-y-2 lg:w-52">
          {data.categories.map((category) => (
            <div
              key={category.id}
              className="relative"
              onMouseEnter={() => setHoverCategoryId(category.id)}
              onMouseLeave={() => setHoverCategoryId(null)}
            >
              <Button
                id={String(category.id)}
                key={category.id}
                name={category.name}
                variant={selectedCategory?.id === category.id ? 'secondary' : 'ghost'}
                className="scrollbar-hide w-full justify-start overflow-x-scroll pr-6"
                onClick={handleClickCategory}
              >
                <div className="flex items-center">
                  <FolderOpen size={16} className="mr-2 text-foreground/70" />
                  <div>{category.name}</div>
                </div>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div
                    className={`absolute right-1 top-[50%] translate-y-[-50%] cursor-pointer py-2 text-foreground/60 ${hoverCategoryId !== category.id && 'invisible'}`}
                  >
                    <MoreVertical size={18} />
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <CategoryDeleteConfirm
                    trigger={<div className="flex justify-center">삭제</div>}
                    deleteCategory={() => handleDeleteCategory(category.id)}
                  />
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
          {isInputOpen ? (
            <form onSubmit={onSubmitCategoryInput}>
              <Input
                autoFocus
                onBlur={() => handleCreateCategory(inputValue)}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setInputValue(e.target.value)}
              />
            </form>
          ) : (
            <Button variant="ghost" onClick={() => setIsInputOpen(true)}>
              <Plus size={16} />
            </Button>
          )}
        </div>
      </div>

      <div className="mt-4 flex w-full px-4 sm:hidden">
        <div className="whitespace-nowrap rounded-lg border border-foreground/50 p-2 font-semibold">카테고리</div>
        <div className="scrollbar-hide ml-2 flex w-full items-center space-x-2 overflow-x-scroll">
          {data.categories.map((category) => (
            <div
              key={category.id}
              className="relative"
              onMouseEnter={() => setHoverCategoryId(category.id)}
              onMouseLeave={() => setHoverCategoryId(null)}
            >
              <Button
                id={String(category.id)}
                key={category.id}
                name={category.name}
                variant={selectedCategory?.id === category.id ? 'secondary' : 'ghost'}
                className="w-full justify-between pr-6"
                onClick={handleClickCategory}
              >
                {category.name}
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div className="absolute right-1 top-[50%] translate-y-[-50%] cursor-pointer py-2 text-foreground/60">
                    <MoreVertical size={18} />
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <CategoryDeleteConfirm
                    trigger={<div className="flex justify-center">삭제</div>}
                    deleteCategory={() => handleDeleteCategory(category.id)}
                  />
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
          {isInputOpen ? (
            <form onSubmit={onSubmitCategoryInput}>
              <Input
                autoFocus
                className="min-w-32"
                onBlur={() => handleCreateCategory(inputValue)}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setInputValue(e.target.value)}
              />
            </form>
          ) : (
            <Button variant="ghost" onClick={() => setIsInputOpen(true)}>
              <Plus size={16} />
            </Button>
          )}
        </div>
      </div>
    </>
  );
}

export default Category;
