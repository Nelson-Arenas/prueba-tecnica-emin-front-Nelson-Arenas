import { z } from "zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";

import { allUsers, getCompanies } from "../api/eminApi";
import type {ActivoPriority, ActivoStatus,ActivoType,CreateActivoDTO,} from "../api/eminApi";
import type { User } from "../types";
import type { Empresas } from "../types";

const ActivoTypeEnum = z.enum(["NOTEBOOK", "MONITOR", "LICENCIA", "PERIFERICO", "OTRO"]);
const ActivoStatusEnum = z.enum(["DISPONIBLE", "ASIGNADO", "MANTENCION", "BAJA"]);
const ActivoPriorityEnum = z.enum(['ALTA', 'MEDIA', 'BAJA']);

// Validador simple para ObjectId
const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, "Debe ser un ObjectId válido");

const schema = z.object({
  code: z.string().trim().min(3, "Código requerido (min 3)").max(30, "Código muy largo"),
  name: z.string().trim().min(3, "Nombre requerido (min 3)").max(120, "Nombre muy largo"),
  type: ActivoTypeEnum,

  brand: z.string().trim().max(60, "Marca muy larga").optional().or(z.literal("")),
  model: z.string().trim().max(60, "Modelo muy largo").optional().or(z.literal("")),

  serialNumber: z.string().trim().min(3, "N° de serie requerido (min 3)").max(80, "Muy largo"),
  status: ActivoStatusEnum,
  priority: ActivoPriorityEnum,

  purchaseDate: z.string().optional().or(z.literal("")), // yyyy-mm-dd

  // ✅ AHORA REQUIRED como ObjectId
  company: objectId,

  location: z.string().trim().min(3, "Ubicación requerida (min 3)").max(120, "Muy largo"),

  assignedUser: z.string().trim().optional().or(z.literal("")), // "" o _id
  notes: z.string().trim().max(500, "Notas muy largas").optional().or(z.literal("")),
});

export type FormActivoValues = z.infer<typeof schema>;

type Props = {
  defaultValues?: Partial<FormActivoValues>;
  loading?: boolean;
  onSubmit: (payload: CreateActivoDTO) => void;
};

export default function FormActivoModal({ defaultValues, loading, onSubmit }: Props) {
  // ✅ Usuarios
  const { data: users, isLoading: usersLoading, isError: usersError } = useQuery<User[]>({
    queryKey: ["allUsers"],
    queryFn: allUsers,
    retry: true,
  });

  // ✅ Empresas
  const {
    data: companies,
    isLoading: companiesLoading,
    isError: companiesError,
  } = useQuery<Empresas[]>({
    queryKey: ["companies"],
    queryFn: getCompanies,
    retry: true,
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
  } = useForm<FormActivoValues>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: {
      code: "",
      name: "",
      type: "NOTEBOOK",
      brand: "",
      model: "",
      serialNumber: "",
      status: "DISPONIBLE",
      purchaseDate: "",
      company: "" as any, // lo dejamos vacío al inicio, el schema lo obligará al submit
      location: "",
      assignedUser: "",
      notes: "",
      priority: "MEDIA",
      ...defaultValues,
    },
  });

  useEffect(() => {
    if (defaultValues) {
      reset({
        code: "",
        name: "",
        type: "NOTEBOOK",
        brand: "",
        model: "",
        serialNumber: "",
        status: "DISPONIBLE",
        purchaseDate: "",
        company: "" as any,
        location: "",
        assignedUser: "",
        notes: "",
        priority: "MEDIA",
        ...defaultValues,
      });
    }
  }, [defaultValues, reset]);

  const submit = (values: FormActivoValues) => {
    console.log("[FormActivoModal] values (raw):", values);

    const payload: CreateActivoDTO = {
      code: values.code.trim(),
      name: values.name.trim(),
      type: values.type as ActivoType,
      brand: values.brand?.trim() || undefined,
      model: values.model?.trim() || undefined,
      serialNumber: values.serialNumber.trim(),
      status: values.status as ActivoStatus,
      priority: values.priority as ActivoPriority,
      purchaseDate: values.purchaseDate
        ? new Date(values.purchaseDate + "T00:00:00.000Z").toISOString()
        : undefined,

      // ✅ aquí ya viene ObjectId válido
      company: values.company,

      location: values.location.trim(),
      assignedUser: values.assignedUser?.trim() ? values.assignedUser.trim() : null,
      notes: values.notes?.trim() || undefined,
    };

    console.log("[FormActivoModal] payload JSON:", JSON.stringify(payload, null, 2));
    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-5">
      {/* Código y Nombre */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Código" required error={errors.code?.message}>
          <Input placeholder="NB-004" {...register("code")} />
        </Field>

        <Field label="Nombre" required error={errors.name?.message}>
          <Input placeholder="Notebook Lenovo ThinkPad..." {...register("name")} />
        </Field>
      </div>

      {/* Tipo y Estado */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Tipo" required error={errors.type?.message}>
          <Select {...register("type")}>
            <option value="NOTEBOOK">Notebook</option>
            <option value="MONITOR">Monitor</option>
            <option value="LICENCIA">Licencia</option>
            <option value="PERIFERICO">Periférico</option>
            <option value="OTRO">Otro</option>
          </Select>
        </Field>

        <Field label="Estado" required error={errors.status?.message}>
          <Select {...register("status")}>
            <option value="DISPONIBLE">Disponible</option>
            <option value="ASIGNADO">Asignado</option>
            <option value="MANTENCION">Mantención</option>
            <option value="BAJA">Baja</option>
          </Select>
        </Field>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Prioridad" required error={errors.priority?.message}>
          <Select {...register("priority")}>
            <option value="ALTA">Alta</option>
            <option value="MEDIA">Media</option>
            <option value="BAJA">Baja</option>
          </Select>
        </Field>
      </div>

      {/* Marca / Modelo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Marca" error={errors.brand?.message}>
          <Input placeholder="Lenovo" {...register("brand")} />
        </Field>

        <Field label="Modelo" error={errors.model?.message}>
          <Input placeholder="ThinkPad T14 Gen 3" {...register("model")} />
        </Field>
      </div>

      {/* Serie */}
      <Field label="Número de serie" required error={errors.serialNumber?.message}>
        <Input placeholder="LNV-..." {...register("serialNumber")} />
      </Field>

      {/* Ubicación */}
      <Field label="Ubicación" required error={errors.location?.message}>
        <Input placeholder="Oficina Central" {...register("location")} />
      </Field>

      {/* Fecha compra + Empresa (select) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Fecha de compra" error={errors.purchaseDate?.message}>
          <Input type="date" {...register("purchaseDate")} />
        </Field>

        <Field label="Empresa" required error={errors.company?.message}>
          <Select {...register("company")} disabled={companiesLoading || companiesError}>
            <option value="">
              {companiesLoading
                ? "Cargando empresas..."
                : companiesError
                ? "Error cargando empresas"
                : "Selecciona una empresa"}
            </option>

            {companies?.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      {/* Usuario (select) */}
      <Field label="Asignar a usuario" error={errors.assignedUser?.message}>
        <Select {...register("assignedUser")} disabled={usersLoading || usersError}>
          <option value="">
            {usersLoading
              ? "Cargando usuarios..."
              : usersError
              ? "Error cargando usuarios"
              : "Sin asignar"}
          </option>

          {users?.map((u) => (
            <option key={u._id} value={u._id}>
              {u.name} {u.lastName} — {u.email}
            </option>
          ))}
        </Select>
      </Field>

      {/* Notes */}
      <Field label="Observaciones" error={errors.notes?.message}>
        <Textarea placeholder="Pc rápido..." {...register("notes")} />
      </Field>

      <button type="submit" disabled={loading || !isValid} className="hidden" aria-hidden="true" />

      <p className="text-xs text-gray-500">
        Campos con <span className="text-red-500">*</span> son obligatorios.
      </p>
    </form>
  );
}

/* UI helpers */
function Field({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </span>
      {children}
      {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
    </label>
  );
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm
      focus:outline-none focus:ring-2 focus:ring-[#184E8B]/30"
    />
  );
}

function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm bg-white
      focus:outline-none focus:ring-2 focus:ring-[#184E8B]/30 disabled:opacity-60"
    />
  );
}

function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      rows={3}
      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm
      focus:outline-none focus:ring-2 focus:ring-[#184E8B]/30"
    />
  );
}
