import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { X, Eye, EyeOff, MonitorSmartphone, ChefHat, UserPlus, ShieldCheck, Coffee } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { IStaffProfile, ROLE } from '../types/staff.type';
import { useCreateStaff, useUpdateStaff } from '../hooks/useStaff';

interface StaffFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  staffData?: IStaffProfile | null;
}

export function StaffFormModal({ isOpen, onClose, staffData }: StaffFormModalProps) {
  const { t } = useTranslation();
  const isEdit = !!staffData;

  const createStaff = useCreateStaff();
  const updateStaff = useUpdateStaff();

  const [showPassword, setShowPassword] = useState(false);

  const schema = z.object({
    fullName: z.string().min(1, t('auth.login.usernameRequired')),
    username: z.string().min(1, t('auth.login.usernameRequired')),
    phone: z.string().optional(),
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
      phone: '',
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
          phone: staffData.phone || '',
          role: staffData.role,
          active: staffData.active,
          password: ''
        });
      } else {
        reset({
          fullName: '',
          username: '',
          phone: '',
          role: ROLE.CASHIER,
          active: true,
          password: ''
        });
      }
      setShowPassword(false);
    }
  }, [isOpen, staffData, reset]);

  const onSubmit = (data: FormData) => {
    if (isEdit && staffData) {
      updateStaff.mutate({
        id: staffData.id,
        data: {
          fullName: data.fullName,
          phone: data.phone,
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
        phone: data.phone,
        role: data.role,
        password: data.password!,
        active: data.active
      }, {
        onSuccess: () => onClose()
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" 
        onClick={() => !createStaff.isPending && !updateStaff.isPending && onClose()} 
      />
      
      {/* Modal Container */}
      <div className="bg-white w-full max-w-xl max-h-[90vh] rounded-[32px] shadow-2xl relative z-10 overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
          <div className="flex items-center gap-3">
             <div className="size-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
               {isEdit ? <ShieldCheck className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
             </div>
             <h3 className="text-lg font-bold text-slate-800 tracking-tight">
              {isEdit ? t('admin.staffModule.modal.titleEdit') : t('admin.staffModule.modal.titleAdd')}
            </h3>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-9 w-9 p-0 hover:bg-primary/10 hover:shadow-sm rounded-xl transition-all text-slate-400 hover:text-primary">
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto p-6 bg-slate-50/30 space-y-4 custom-scrollbar">
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

          <div className="grid grid-cols-2 gap-4">
            <div className={!isEdit ? "col-span-1" : "col-span-2"}>
              <Input
                label={t('admin.staffModule.modal.phone')}
                {...register('phone')}
                placeholder={t('admin.staffModule.modal.phonePlaceholder', 'Nhập số điện thoại')}
                error={errors.phone}
                type="text"
                className="!py-2.5 !rounded-xl"
              />
            </div>
            
            {!isEdit && (
              <div className="col-span-1 flex flex-col justify-end">
                <div className="flex items-center justify-between bg-white px-4 h-[46px] rounded-xl border border-slate-100 shadow-sm">
                   <div className="flex flex-col">
                      <span className="text-xs font-bold text-slate-800">{t('admin.staffModule.modal.status')}</span>
                   </div>
                   <label className="relative inline-flex items-center cursor-pointer">
                      <input {...register('active')} type="checkbox" className="sr-only peer" />
                      <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                   </label>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">{t('admin.staffModule.modal.password')}</label>
            <div className="relative">
              <input
                {...register('password')}
                className={`w-full pl-4 pr-10 py-2.5 bg-white border border-slate-200 text-slate-900 focus:ring-4 focus:ring-primary/10 transition-all outline-none rounded-xl text-sm font-mono ${errors.password ? 'border-red-500' : ''}`}
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
            {errors.password && <p className="text-[10px] text-red-500 font-bold ml-1 mt-1">{errors.password.message}</p>}
          </div>

          <div>
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">{t('admin.staffModule.modal.role')}</label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: ROLE.CASHIER, icon: <MonitorSmartphone className="w-5 h-5" /> },
                { value: ROLE.KITCHEN, icon: <ChefHat className="w-5 h-5" /> },
                { value: ROLE.SERVER, icon: <Coffee className="w-5 h-5" /> }
              ].map(r => (
                <label key={r.value} className={`relative flex flex-col items-center justify-center p-3 border-2 rounded-2xl cursor-pointer transition-all ${watchRole === r.value ? 'border-primary bg-primary/5' : 'border-slate-100 bg-white hover:border-slate-200'}`}>
                  <input
                    {...register('role')}
                    type="radio"
                    value={r.value}
                    className="sr-only"
                  />
                  <span className={`${watchRole === r.value ? 'text-primary' : 'text-slate-400'}`}>{r.icon}</span>
                  <span className={`text-[10px] font-black mt-1 uppercase tracking-tight ${watchRole === r.value ? 'text-primary' : 'text-slate-500'}`}>
                    {t(`admin.staffModule.roles.${r.value}`)}
                  </span>
                  {watchRole === r.value && <div className="absolute inset-0 border-2 border-primary rounded-2xl pointer-events-none"></div>}
                </label>
              ))}
            </div>
          </div>


        </form>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex gap-4 shrink-0">
          <Button
            onClick={onClose}
            type="button"
            variant="ghost"
            className="flex-1 py-3 rounded-xl font-black uppercase text-xs tracking-widest bg-white hover:bg-slate-100 border border-slate-200"
          >
            {t('admin.staffModule.modal.cancel')}
          </Button>
          <Button
            onClick={handleSubmit(onSubmit)}
            isLoading={createStaff.isPending || updateStaff.isPending}
            className="flex-1 py-3 rounded-xl bg-primary text-white font-black uppercase text-xs tracking-widest hover:bg-primary/90 shadow-lg shadow-primary/20"
          >
            {t('admin.staffModule.modal.save')}
          </Button>
        </div>
      </div>
    </div>
  );
}
