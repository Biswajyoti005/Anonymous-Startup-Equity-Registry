import { createFileRoute } from '@tanstack/react-router';
import { EquityRegistry } from '@/pages/equity-registry';

export const Route = createFileRoute('/equity-registry')({ component: EquityRegistry });
