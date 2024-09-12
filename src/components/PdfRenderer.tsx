'use client'

import React, { useState } from 'react';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { Document, Page, pdfjs } from 'react-pdf';
import { ChevronDown, ChevronUp, Divide, Loader2, RotateCw, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useResizeDetector } from 'react-resize-detector';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { cn } from '@/lib/utils';
import { DropdownMenu, DropdownMenuItem, DropdownMenuContent, DropdownMenuTrigger } from './ui/dropdown-menu';
import SimpleBar from 'simplebar-react';  // Use correct import here
import 'simplebar-react/dist/simplebar.min.css';  // Make sure CSS is correctly imported
import PdfFullScreen from './PdfFullScreen';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface PrfRenderedProps {
  url: string;
}

const PdfRenderer = ({ url }: PrfRenderedProps) => {
  const { toast } = useToast();
  const [numPages, setNumPages] = useState<number>();
  const [currPage, setCurrPage] = useState<number>(1);
  const [scale, setScale] = useState<number>(1);
  const { width, ref } = useResizeDetector();
  const [rotation, setRotation] = useState<number>(0);
  const [renderedScale,setRenderedScale] = useState<number | null>(null)
  const isLoading = renderedScale !== scale

  const customPageValidator = z.object({
    page: z.string().refine((num) => Number(num) > 0 && Number(num) <= (numPages ?? 1)),  // Safe check for numPages
  });

  type TCustomPageValidator = z.infer<typeof customPageValidator>;

  const { register, handleSubmit, formState: { errors }, setValue } = useForm<TCustomPageValidator>({
    defaultValues: {
      page: '1',
    },
    resolver: zodResolver(customPageValidator),
  });

  const handlePageSubmit = ({ page }: TCustomPageValidator) => {
    const pageNum = Number(page);
    setCurrPage(pageNum);
    setValue('page', String(pageNum));
  };

  const handlePrevPage = () => {
    setCurrPage((prev) => {
      const newPage = Math.max(prev - 1, 1);
      setValue('page', String(newPage));
      return newPage;
    });
  };

  const handleNextPage = () => {
    setCurrPage((prev) => {
      const newPage = Math.min(prev + 1, numPages!);
      setValue('page', String(newPage));
      return newPage;
    });
  };

  return (
    <div className='w-full bg-white rounded-md shadow flex flex-col items-center'>
      <div className='h-14 w-full border-b border-zinc-200 flex items-center justify-between'>
        <div className='flex items-center gap-1.5'>
          <Button 
            disabled={currPage <= 1}
            variant='ghost'
            aria-label='previous page'
            onClick={handlePrevPage}
          >
            <ChevronDown className='h-4 w-4' />
          </Button>
          <div className='flex items-center gap-1.5'>
            <Input 
              {...register('page')}
              className={cn('w-12 h-8', errors.page && 'focus-visible:ring-red-500')}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSubmit(handlePageSubmit)();
                }
              }}
            />
            <p className='text-zinc-700 text-md space-x-1'>
              <span>/</span>
              <span>{numPages ?? 'x'}</span>
            </p>
          </div>
          <Button 
            disabled={numPages === undefined || currPage === numPages}
            onClick={handleNextPage}
            variant='ghost'
            aria-label='next page'
          >
            <ChevronUp className='h-4 w-4' />
          </Button>
        </div>

        <div className='space-x-2'>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className='gap-1.5' aria-label='zoom' variant='ghost'>
                <Search className='h-4 w-4' />
                {scale * 100}%
                <ChevronDown className='h-3 w-3 opacity-50' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setScale(1)}>100%</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setScale(1.5)}>150%</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setScale(2)}>200%</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setScale(2.5)}>250%</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
          variant='ghost' 
          onClick={() => setRotation((prev) => prev + 90)} aria-label='rotate 90 degrees'>
            <RotateCw className='h-4 w-4' />
          </Button>
          <PdfFullScreen fileUrl={url} />

          
        </div>
      </div>

      <div className='flex-1 w-full max-h-screen'>
        <SimpleBar autoHide={false} className='max-h-[calc(100vh-10rem)]'>
          <div ref={ref}>
            <Document
              loading={
                <div className='flex justify-center'>
                  <Loader2 className='my-24 h-6 w-6 animate-spin' />
                </div>
              }
              onLoadError={() => {
                toast({
                  title: 'Error loading PDF',
                  description: 'Please try again later',
                  variant: 'destructive',
                });
              }}
              onLoadSuccess={({ numPages }) => {
                setNumPages(numPages);
              }}
              file={url}
              className='max-h-full'
            >
              {isLoading && renderedScale ?  <Page 
                width={width ? width : 1} 
                pageNumber={currPage} 
                scale={scale} 
                rotate={rotation} 
                key={"@"+renderedScale}
              />:null}
                <Page 
                className={cn(isLoading ? "hidden" : "")}
                width={width ? width : 1} 
                pageNumber={currPage} 
                scale={scale} 
                rotate={rotation} 
                key={"@"+scale}
                loading={
                  <div className='flex justify-center'>
                    <Loader2 className='my-24 h-6 w-6 animate-spin'/>
                  </div>
                }
                onRenderSuccess={()=>setRenderedScale(scale)}
              />
            </Document>
          </div>
        </SimpleBar>
      </div>
    </div>
  );
};

export default PdfRenderer;
