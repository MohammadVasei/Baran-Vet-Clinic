-- Associate each service option with the doctor who handles it.
ALTER TABLE public.services
    ADD COLUMN IF NOT EXISTS doctor_id uuid REFERENCES public.doctors(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_services_doctor_id ON public.services (doctor_id);

-- Preserve the current booking assignments for existing services.
UPDATE public.services AS services
SET doctor_id = doctors.id
FROM public.doctors AS doctors
WHERE services.doctor_id IS NULL
  AND doctors.key = CASE
    WHEN services.category = 'grooming' THEN 'moghan-jahani'
    ELSE 'dr-tazik'
  END;
