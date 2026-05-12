import React from 'react';
import { StaffCallResponse } from '../types/server.types';
import { useAcceptCallMutation, useResolveCallMutation } from '../hooks/useServerData';
import { useAppSelector } from '@/store/hooks';
import { Button } from '@/shared/components/ui/Button';
import { useTranslation } from 'react-i18next';
import { formatDistance } from 'date-fns';
import { vi } from 'date-fns/locale';

import { useServerTime } from '@/shared/hooks/useServerTime';

interface StaffCallCardProps {
  call: StaffCallResponse;
}

export const StaffCallCard: React.FC<StaffCallCardProps> = ({ call }) => {
  const { t } = useTranslation();
  const user = useAppSelector(state => state.auth.user);
  const acceptMutation = useAcceptCallMutation();
  const resolveMutation = useResolveCallMutation();
  const { serverTime } = useServerTime(5000);

  const isPending = call.status === 'PENDING';
  const isAccepted = call.status === 'ACCEPTED';
  const isAcceptedByMe = isAccepted && call.acceptedBy === user?.id;
  const isAcceptedByOther = isAccepted && call.acceptedBy !== user?.id;

  const handleAccept = () => {
    acceptMutation.mutate({ callId: call.id, userName: user?.fullName });
  };

  const handleResolve = () => {
    resolveMutation.mutate(call.id);
  };

  const pendingTimeText = formatDistance(new Date(call.createdAt), serverTime, { addSuffix: true, locale: vi });

  return (
    <div className={`p-4 rounded-xl shadow-sm mb-4 border transition-colors ${isAcceptedByOther ? 'bg-surface-dim border-outline-variant opacity-70' : 'bg-surface-bright border-primary/20'}`}>
      <div className="flex justify-between items-start mb-3">
        <div className="min-w-0 pr-2">
          <h3 className="text-lg font-bold text-on-surface truncate">{t('server.table', { number: call.tableNumber || 'N/A' })}</h3>
          <p className="text-primary font-medium mt-1 truncate">{call.callType}</p>
        </div>
        <div className="text-right shrink-0">
          <span className="text-xs text-on-surface-variant bg-surface-container px-2 py-1 rounded-md">{pendingTimeText}</span>
        </div>
      </div>

      <div className="mt-4 flex gap-3">
        {isPending && (
          <Button
            onClick={handleAccept}
            disabled={acceptMutation.isPending}
            variant="secondary"
            className="flex-1"
          >
            {acceptMutation.isPending ? t('server.pending_call') : t('server.accept_call')}
          </Button>
        )}

        {isAcceptedByMe && (
          <Button
            onClick={handleResolve}
            disabled={resolveMutation.isPending}
            variant="primary"
            className="flex-1"
          >
            {resolveMutation.isPending ? t('server.resolving_call') : t('server.resolve_call')}
          </Button>
        )}

        {isAcceptedByOther && (
          <div className="flex-1 bg-surface-container-high text-on-surface-variant font-medium py-2 rounded-lg text-center border border-outline-variant text-sm flex items-center justify-center">
            {t('server.call_accepted_other')}
          </div>
        )}
      </div>
    </div>
  );
};
