import Swal from 'sweetalert2';

const customSwal = Swal.mixin({
  customClass: {
    popup: '!bg-slate-900/90 !backdrop-blur-xl !border !border-white/10 !rounded-3xl !shadow-2xl',
    title: '!text-xl !font-bold !text-white',
    htmlContainer: '!text-slate-400 !text-sm !mt-2',
    confirmButton: '!bg-blue-600 hover:!bg-blue-500 !text-white !px-5 !py-2.5 !rounded-xl !font-semibold !shadow-lg !shadow-blue-600/20 !transition-all !mx-2',
    cancelButton: '!bg-slate-800 hover:!bg-slate-700 !text-slate-300 !px-5 !py-2.5 !rounded-xl !font-medium !border !border-slate-700 !transition-all !mx-2',
    actions: '!mt-6',
  },
  buttonsStyling: false,
  background: 'transparent',
  color: '#f8fafc',
});

export default customSwal;
