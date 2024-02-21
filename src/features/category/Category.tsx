import { ChangeEvent, MouseEventHandler, useState } from 'react';
import { Txt } from '@/components/Txt';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { MoreVertical } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { FolderOpen } from 'lucide-react';
import { CategoryDeleteConfirm } from './CategoryDeleteConfirm';
import { useCategory } from './hooks/useCategory';
import { useCategoryStore } from './stores/categoryStore';

function Category() {
  const { categories, createCategory, deleteCategory } = useCategory();
  const { selectedCategory, selectCategory } = useCategoryStore();

  const [hoverCategoryId, setHoverCategoryId] = useState<number | null>();
  const [newCategoryInputInputOpened, setNewCategoryInputInputOpened] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  const handleClickCategory: MouseEventHandler<HTMLButtonElement> = (e) => {
    const $button = e.currentTarget as HTMLButtonElement;

    if ($button.id && $button.name) {
      selectCategory({ id: Number($button.id), name: $button.name });
    }
  };

  const handleCreateCategory = (categoryName: string) => {
    setNewCategoryInputInputOpened(false);
    setNewCategoryName('');

    createCategory(categoryName);
  };

  return (
    <>
      <div className="hidden space-y-6 p-4 sm:block md:p-8 lg:py-12">
        <div className="w-36 lg:w-52">
          <Txt typography="h3">카테고리</Txt>
          <div className="h-[2px] w-full bg-foreground" />
        </div>
        <div className="flex w-36 flex-col space-y-2 lg:w-52">
          {categories.map((category) => (
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
                className="w-full justify-start overflow-x-scroll pr-6 scrollbar-hide"
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
                  <CategoryDeleteConfirm trigger="삭제" deleteCategory={() => deleteCategory(category.id)} />
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
          {newCategoryInputInputOpened ? (
            <form onSubmit={() => handleCreateCategory(newCategoryName)}>
              <Input
                autoFocus
                onBlur={() => handleCreateCategory(newCategoryName)}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setNewCategoryName(e.target.value)}
              />
            </form>
          ) : (
            <Button variant="ghost" onClick={() => setNewCategoryInputInputOpened(true)}>
              <Plus size={16} />
            </Button>
          )}
        </div>
      </div>

      <div className="mb-2 mt-4 flex w-full px-4 sm:hidden">
        <div className="whitespace-nowrap rounded-lg p-2 font-semibold shadow-sm">카테고리</div>
        <div className="ml-2 flex space-x-2 overflow-x-scroll scrollbar-hide">
          {categories.map((category) => (
            <div key={category.id} className="relative">
              <Button
                id={String(category.id)}
                key={category.id}
                name={category.name}
                variant={selectedCategory?.id === category.id ? 'secondary' : 'ghost'}
                className="pr-6"
                onClick={handleClickCategory}
              >
                {category.name}
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div className="absolute right-0 top-[50%] translate-y-[-50%] py-2 pr-1 text-foreground/60">
                    <MoreVertical size={18} />
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <CategoryDeleteConfirm trigger="삭제" deleteCategory={() => deleteCategory(category.id)} />
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
          {newCategoryInputInputOpened ? (
            <form onSubmit={() => handleCreateCategory(newCategoryName)}>
              <Input
                autoFocus
                className="max-w-32"
                onBlur={() => handleCreateCategory(newCategoryName)}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setNewCategoryName(e.target.value)}
              />
            </form>
          ) : (
            <Button variant="ghost" onClick={() => setNewCategoryInputInputOpened(true)}>
              <Plus size={16} />
            </Button>
          )}
        </div>
      </div>
    </>
  );
}

export default Category;
