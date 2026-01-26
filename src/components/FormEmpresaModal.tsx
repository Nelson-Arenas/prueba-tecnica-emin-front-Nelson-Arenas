import { useEffect } from "react";
import { useForm } from "react-hook-form";

export type FormEmpresaValues = {
  name: string;
};

type Props = {
  defaultValues?: Partial<FormEmpresaValues>;
  loading?: boolean;
  onSubmit: (payload: FormEmpresaValues) => void;
};

export default function FormEmpresaModal({
  defaultValues,
  loading = false,
  onSubmit,
}: Props) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormEmpresaValues>({
    defaultValues: {
      name: "",
      ...defaultValues,
    },
  });

  // 🔁 cuando cambian los defaultValues (modo editar)
  useEffect(() => {
    if (defaultValues) {
      reset({
        name: defaultValues.name ?? "",
      });
    }
  }, [defaultValues, reset]);

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-5"
      noValidate
    >
      {/* Nombre empresa */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nombre de la empresa
        </label>

        <input
          type="text"
          placeholder="Ej: GRUPO EMIN"
          disabled={loading}
          {...register("name", {
            required: "El nombre de la empresa es obligatorio",
            minLength: {
              value: 2,
              message: "El nombre debe tener al menos 2 caracteres",
            },
          })}
          className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#184E8B]/30 ${
            errors.name
              ? "border-red-300 focus:ring-red-200"
              : "border-gray-200"
          }`}
        />

        {errors.name && (
          <p className="mt-1 text-xs text-red-600">
            {errors.name.message}
          </p>
        )}
      </div>
    </form>
  );
}
