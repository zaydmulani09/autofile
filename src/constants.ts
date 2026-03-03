import { FileItem, SmartRule } from './types';

export const MOCK_FILES: FileItem[] = [
  { id: '1', name: 'invoice_2023.pdf', size: 1024 * 450, type: 'application/pdf', extension: 'pdf', lastModified: Date.now() - 1000 * 60 * 60 * 24 * 2, path: '/Downloads' },
  { id: '2', name: 'vacation_photo.jpg', size: 1024 * 1024 * 3.2, type: 'image/jpeg', extension: 'jpg', lastModified: Date.now() - 1000 * 60 * 60 * 5, path: '/Pictures' },
  { id: '3', name: 'project_spec.docx', size: 1024 * 120, type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', extension: 'docx', lastModified: Date.now() - 1000 * 60 * 30, path: '/Documents' },
  { id: '4', name: 'budget_v1.xlsx', size: 1024 * 85, type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', extension: 'xlsx', lastModified: Date.now() - 1000 * 60 * 60 * 24 * 10, path: '/Documents' },
  { id: '5', name: 'profile_pic.png', size: 1024 * 1024 * 1.1, type: 'image/png', extension: 'png', lastModified: Date.now() - 1000 * 60 * 60 * 24 * 1, path: '/Pictures' },
  { id: '6', name: 'presentation_final.pptx', size: 1024 * 1024 * 12.5, type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation', extension: 'pptx', lastModified: Date.now() - 1000 * 60 * 60 * 2, path: '/Documents' },
  { id: '7', name: 'vacation_photo_copy.jpg', size: 1024 * 1024 * 3.2, type: 'image/jpeg', extension: 'jpg', lastModified: Date.now() - 1000 * 60 * 60 * 5, path: '/Downloads', isDuplicate: true },
  { id: '8', name: 'script.py', size: 1024 * 12, type: 'text/x-python', extension: 'py', lastModified: Date.now() - 1000 * 60 * 60 * 24 * 15, path: '/Code' },
];

export const MOCK_RULES: SmartRule[] = [
  { id: 'r1', name: 'Move PDFs to Documents', condition: 'type', operator: 'equals', value: 'pdf', action: 'move', actionValue: '/Documents/PDFs', enabled: true },
  { id: 'r2', name: 'Organize Images', condition: 'type', operator: 'contains', value: 'image', action: 'move', actionValue: '/Pictures/Sorted', enabled: true },
  { id: 'r3', name: 'Archive Large Files', condition: 'size', operator: 'greaterThan', value: '100', action: 'move', actionValue: '/Archive/Large', enabled: false },
];

export const FILE_TYPE_COLORS: Record<string, string> = {
  pdf: '#ef4444',
  image: '#3b82f6',
  doc: '#10b981',
  code: '#f59e0b',
  other: '#6b7280',
};
