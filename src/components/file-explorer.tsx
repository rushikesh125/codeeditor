"use client";

import React, { useState } from 'react';
import type { CodeFile } from '@/types';
import { Sidebar, SidebarHeader, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { FileCode, Plus, Pencil, Trash2 } from 'lucide-react';

interface FileExplorerProps {
  files: CodeFile[];
  activeFileId: string | null;
  onFileSelect: (id: string) => void;
  onAddFile: (name: string) => void;
  onDeleteFile: (id: string) => void;
  onRenameFile: (id: string, newName: string) => void;
}

export default function FileExplorer({ files, activeFileId, onFileSelect, onAddFile, onDeleteFile, onRenameFile }: FileExplorerProps) {
  const [addFileDialogOpen, setAddFileDialogOpen] = useState(false);
  const [renameFileDialogOpen, setRenameFileDialogOpen] = useState(false);
  const [deleteDialogFile, setDeleteDialogFile] = useState<CodeFile | null>(null);
  
  const [newFileName, setNewFileName] = useState('');
  const [renameFile, setRenameFile] = useState<CodeFile | null>(null);

  const handleAddSubmit = () => {
    onAddFile(newFileName);
    setNewFileName('');
    setAddFileDialogOpen(false);
  };

  const handleRenameSubmit = () => {
    if (renameFile) {
      onRenameFile(renameFile.id, newFileName);
    }
    setNewFileName('');
    setRenameFile(null);
    setRenameFileDialogOpen(false);
  };
  
  const openRenameDialog = (file: CodeFile) => {
    setRenameFile(file);
    setNewFileName(file.name);
    setRenameFileDialogOpen(true);
  };

  return (
    <>
      <Sidebar>
        <SidebarHeader>
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold font-headline text-sidebar-foreground">Files</h2>
            <Button variant="ghost" size="icon" className="text-sidebar-foreground hover:text-sidebar-accent-foreground hover:bg-sidebar-accent" onClick={() => setAddFileDialogOpen(true)}>
              <Plus className="h-4 w-4" />
              <span className="sr-only">Add File</span>
            </Button>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {files.map(file => (
              <SidebarMenuItem key={file.id} className="group/item">
                <SidebarMenuButton 
                  onClick={() => onFileSelect(file.id)}
                  isActive={activeFileId === file.id}
                  className="flex justify-between w-full"
                >
                  <div className="flex items-center gap-2">
                    <FileCode className="h-4 w-4" />
                    <span className="truncate">{file.name}</span>
                  </div>
                </SidebarMenuButton>
                 <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center opacity-0 group-hover/item:opacity-100 transition-opacity bg-sidebar-accent rounded-md">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openRenameDialog(file)}>
                        <Pencil className="h-3.5 w-3.5" />
                         <span className="sr-only">Rename file</span>
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-destructive/10" onClick={() => setDeleteDialogFile(file)}>
                        <Trash2 className="h-3.5 w-3.5 text-destructive" />
                        <span className="sr-only">Delete file</span>
                    </Button>
                </div>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>

      <Dialog open={addFileDialogOpen} onOpenChange={setAddFileDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New File</DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); handleAddSubmit(); }}>
            <div className="grid gap-4 py-4">
              <Input
                placeholder="filename.js"
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                autoFocus
              />
            </div>
            <DialogFooter>
              <DialogClose asChild>
                  <Button type="button" variant="secondary">Cancel</Button>
              </DialogClose>
              <Button type="submit">Create</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      <Dialog open={renameFileDialogOpen} onOpenChange={setRenameFileDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename File</DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); handleRenameSubmit(); }}>
            <div className="grid gap-4 py-4">
              <Input
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                autoFocus
              />
            </div>
            <DialogFooter>
              <DialogClose asChild>
                  <Button type="button" variant="secondary">Cancel</Button>
              </DialogClose>
              <Button type="submit">Rename</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteDialogFile} onOpenChange={(open) => !open && setDeleteDialogFile(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the file "{deleteDialogFile?.name}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteDialogFile(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteDialogFile) {
                  onDeleteFile(deleteDialogFile.id);
                }
                setDeleteDialogFile(null);
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
