import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { X, Eye, EyeOff, MonitorSmartphone, ChefHat } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { IStaff, ROLE } from '../types/adminStaff.type';
import { useCreateStaff, useUpdateStaff } from '../hooks/useStaff';

interface StaffFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  staffData?: IStaff | null;
}

export function StaffFormModal({ isOpen, onClose, staffData }: StaffFormModalProps) {
  const { t } = useTranslation();
  const isEdit = !!staffData;

  const createStaff = useCreateStaff();
  const updateStaff = useUpdateStaff();

  const [showPassword, setShowPassword] = useState(false);

  const schema = z.object({
    fullName: z.string().min(1, t('auth.login.usernameRequired')), // reuse required string
    username: z.string().min(1, t('auth.login.usernameRequired')),
    password: z.string()
      .refine(val => (isEdit && !val) || val.length >= 6, {
        message: t('auth.login.passwordMinLength')
      })
      .optional(),
    role: z.nativeEnum(ROLE),
    active: z.boolean()
  });

  type FormData = z.infer<typeof schema>;

  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: '',
      username: '',
      role: ROLE.CASHIER,
      active: true,
      password: ''
    }
  });

  const watchRole = watch('role');

  useEffect(() => {
    if (isOpen) {
      if (staffData) {
        reset({
          fullName: staffData.fullName,
          username: staffData.username,
          role: staffData.role,
          active: staffData.active,
          password: ''
        });
      } else {
        reset({
          fullName: '',
          username: '',
          role: ROLE.CASHIER,
          active: true,
          password: ''
        });
      }
      setShowPassword(false);
    }
  }, [isOpen, staffData, reset]);

  if (!isOpen) return null;

  const onSubmit = (data: FormData) => {
    if (isEdit && staffData) {
      updateStaff.mutate({
        id: staffData.id,
        payload: {
          fullName: data.fullName,
          role: data.role,
          ...(data.password ? { password: data.password } : {})
        }
      }, {
        onSuccess: () => onClose()
      });
    } else {
      createStaff.mutate({
        fullName: data.fullName,
        username: data.username,
        role: data.role,
        password: data.password!,
        active: data.active
      }, {
        onSuccess: () => onClose()
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden ring-1 ring-slate-100 animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <h3 className="text-xl font-bold text-slate-900">
            {isEdit ? t('admin.staffModule.modal.titleEdit') : t('admin.staffModule.modal.titleAdd')}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
          <Input
            label={t('admin.staffModule.modal.fullName')}
            {...register('fullName')}
            placeholder={t('admin.staffModule.modal.fullNamePlaceholder')}
            error={errors.fullName}
            type="text"
            className="!py-2.5 !rounded-xl"
          />

          <Input
            label={t('admin.staffModule.modal.username')}
            {...register('username')}
            disabled={isEdit}
            placeholder={t('admin.staffModule.modal.usernamePlaceholder')}
            error={errors.username}
            type="text"
            className="!py-2.5 !rounded-xl !font-mono"
          />

          <div>
            <label className="block text-sm font-semibold text-on-surface-variant ml-1 mb-1">{t('admin.staffModule.modal.password')}</label>
            <div className="relative">
              <input
                {...register('password')}
                className={`w-full pl-4 pr-10 py-2.5 bg-surface-container-high border-none text-on-surface focus:ring-2 focus:ring-surface-tint focus:bg-white transition-all outline-none rounded-xl text-sm font-mono ${errors.password ? 'ring-2 ring-error' : ''}`}
                placeholder={isEdit ? t('admin.staffModule.modal.passwordLeaveBlank') : t('admin.staffModule.modal.passwordPlaceholder')}
                type={showPassword ? 'text' : 'password'}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-error ml-1 mt-1">{errors.password.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">{t('admin.staffModule.modal.role')}</label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: ROLE.CASHIER, icon: <MonitorSmartphone className="w-5 h-5" />, code: 'roleCashier' },
                { value: ROLE.KITCHEN, icon: <ChefHat className="w-5 h-5" />, code: 'roleKitchen' }
              ].map(r => (
                <label key={r.value} className={`relative flex flex-col items-center justify-center p-3 border-2 rounded-xl cursor-pointer transition-all ${watchRole === r.value ? 'border-primary' : 'border-slate-200 hover:border-slate-200'}`}>
                  <input
                    {...register('role')}
                    type="radio"
                    value={r.value}
                    className="sr-only peer"
                  />
                  <span className={`${watchRole === r.value ? 'text-primary' : 'text-slate-400'}`}>{r.icon}</span>
                  <span className={`text-[10px] font-bold mt-1 uppercase ${watchRole === r.value ? 'text-primary' : 'text-slate-500'}`}>
                    {t(`admin.staffModule.roles.${r.value}`)}
                  </span>
                  {watchRole === r.value && <div className="absolute inset-0 border-2 border-primary rounded-xl"></div>}
                </label>
              ))}
            </div>
          </div>

          {!isEdit && (
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-bold text-slate-700">{t('admin.staffModule.modal.status')}</p>
                <p className="text-xs text-slate-500">{t('admin.staffModule.modal.statusDesc')}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input {...register('active')} type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
              </label>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200">
            <Button
              onClick={onClose}
              type="button"
              variant="outline"
              className="w-full !py-3 !rounded-xl"
            >
              {t('admin.staffModule.modal.cancel')}
            </Button>
            <Button
              type="submit"
              isLoading={createStaff.isPending || updateStaff.isPending}
              className="w-full !py-3 !rounded-xl"
            >
              {t('admin.staffModule.modal.save')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
