<script setup lang="ts">
import { ref } from 'vue';
import { useForm } from 'vee-validate';
import * as yup from 'yup';

// ── Standalone refs ──
const text = ref('');
const emailText = ref('');
const passwordText = ref('');
const searchText = ref('');
const maskedValue = ref('');
const unmaskedValue = ref('');
const phoneValue = ref('');
const zipValue = ref('');
const numberValue = ref<number | null>(null);
const currencyValue = ref<number | null>(null);
const currencyEUR = ref<number | null>(null);
const selected = ref(null);
const selectedMultiple = ref([]);
const selectedTags = ref([]);
const selectedGrouped = ref(null);
const selectedDeselect = ref('us');
const selectedNoSearch = ref(null);
const selectedHideClear = ref(null);
const selectedObject = ref(null);
const date = ref<Date | null>(null);

const countryOptions = [
  { value: 'us', label: 'United States' },
  { value: 'ca', label: 'Canada' },
  { value: 'uk', label: 'United Kingdom' },
  { value: 'de', label: 'Germany' },
  { value: 'fr', label: 'France' },
  { value: 'jp', label: 'Japan' },
  { value: 'au', label: 'Australia' },
];

const departmentOptions = [
  { value: 'engineering', label: 'Engineering' },
  { value: 'design', label: 'Design' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'sales', label: 'Sales' },
  { value: 'hr', label: 'Human Resources' },
  { value: 'finance', label: 'Finance' },
];

const skillOptions = [
  { value: 'vue', label: 'Vue.js' },
  { value: 'react', label: 'React' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'node', label: 'Node.js' },
  { value: 'python', label: 'Python' },
  { value: 'figma', label: 'Figma' },
  { value: 'sql', label: 'SQL' },
];

const groupedOptions = [
  { value: 'vue', label: 'Vue.js', category: 'Frontend' },
  { value: 'react', label: 'React', category: 'Frontend' },
  { value: 'angular', label: 'Angular', category: 'Frontend' },
  { value: 'node', label: 'Node.js', category: 'Backend' },
  { value: 'django', label: 'Django', category: 'Backend' },
  { value: 'rails', label: 'Rails', category: 'Backend' },
  { value: 'postgres', label: 'PostgreSQL', category: 'Database' },
  { value: 'mongo', label: 'MongoDB', category: 'Database' },
];

const primitiveOptions = ['Apple', 'Banana', 'Cherry', 'Date', 'Elderberry'];

// ── Form validation ──
const validationSchema = yup.object({
  fullName: yup.string().required('Full name is required'),
  email: yup.string().required('Email is required').email('Enter a valid email address'),
  phone: yup.string().required('Phone number is required').matches(/^\d{3}-\d{3}-\d{4}$/, 'Format: 555-123-4567'),
  salary: yup.number().required('Expected salary is required'),
  zipCode: yup.string().required('ZIP code is required').matches(/^\d{5}(-\d{4})?$/, 'Format: 90210 or 90210-1234'),
  country: yup.string().required('Country is required'),
  departments: yup.array().min(1, 'Select at least one department').required('Department is required'),
  skills: yup.array().min(1, 'Add at least one skill').required('Skills are required'),
  startDate: yup.date().required('Start date is required'),
  employeeId: yup.string().required('Employee ID is required').matches(/^EMP-\d{4}-\d{4}$/, 'Format: EMP-0000-0000'),
  photos: yup
    .array()
    .required('Upload at least one photo')
    .min(1, 'Upload at least one photo')
    .max(3, 'Maximum 3 photos allowed')
    .test('fileSize', 'Each file must be under 5 MB', (files) =>
      !files || files.every((f: File) => f.size <= 5 * 1024 * 1024),
    )
    .test('fileType', 'Only image files are allowed', (files) =>
      !files || files.every((f: File) => f.type.startsWith('image/')),
    ),
});

const { handleSubmit } = useForm({
  validationSchema,
});

const submitted = ref(false);

const onSubmit = handleSubmit((values) => {
  submitted.value = true;
  console.log('Form values:', values);
});
</script>

<template>
  <div class="mx-auto max-w-2xl space-y-8 p-8">
    <h1 class="text-2xl font-bold">Kinoy Dev Playground</h1>

    <form class="space-y-4" novalidate @submit.prevent="onSubmit">
      <h2 class="text-lg font-semibold">New Employee Registration</h2>

      <KInput
        name="fullName"
        label="Full Name"
        placeholder="John Doe"
        required
      />

      <KInput
        name="email"
        label="Email Address"
        placeholder="john.doe@company.com"
        required
      />

      <KInputPhone
        name="phone"
        label="Phone Number"
        placeholder="555-123-4567"
        required
      />

      <KInputCurrency
        name="salary"
        label="Expected Salary"
        placeholder="75,000"
        required
      />

      <KInputZip
        name="zipCode"
        label="ZIP Code"
        placeholder="90210"
        required
      />

      <KSelect
        name="country"
        :options="countryOptions"
        option-value="value"
        option-label="label"
        label="Country"
        placeholder="Select your country"
        local
        required
      />

      <KSelect
        name="departments"
        :options="departmentOptions"
        option-value="value"
        option-label="label"
        label="Departments"
        placeholder="Select departments"
        mode="multiple"
        local
        required
      />

      <KSelect
        name="skills"
        :options="skillOptions"
        option-value="value"
        option-label="label"
        label="Skills"
        placeholder="Add your skills"
        mode="tags"
        :create-option="true"
        local
        required
      />

      <KDatepicker
        name="startDate"
        label="Start Date"
        placeholder="Pick a start date"
        required
      />

      <KInputMask
        name="employeeId"
        label="Employee ID"
        placeholder="EMP-0000-0000"
        :mask="{ mask: 'EMP-0000-0000' }"
        required
      />

      <KInputFile
        name="photos"
        label="Photos"
        accept="image/*"
        :max-files="3"
        multiple
        hint="Up to 3 images, max 5 MB each"
        required
      />

      <KButton type="submit" label="Register Employee" />

      <p v-if="submitted" class="text-sm text-green-600">Employee registered successfully!</p>
    </form>

    <hr class="border-slate-200" />

    <!-- ════════════════════════════════════════════════ -->
    <!--  KInput                                          -->
    <!-- ════════════════════════════════════════════════ -->
    <section class="space-y-4">
      <h2 class="text-lg font-semibold">KInput</h2>

      <h3 class="text-sm font-medium text-gray-400">Default (text)</h3>
      <KInput v-model="text" label="Name" placeholder="Enter your name" hint="Your full name" />
      <p class="text-sm text-gray-500">Value: {{ text }}</p>

      <h3 class="text-sm font-medium text-gray-400">type="email"</h3>
      <KInput v-model="emailText" type="email" label="Email" placeholder="john@example.com" />

      <h3 class="text-sm font-medium text-gray-400">type="password"</h3>
      <KInput v-model="passwordText" type="password" label="Password" placeholder="Enter password" />

      <h3 class="text-sm font-medium text-gray-400">type="search"</h3>
      <KInput v-model="searchText" type="search" label="Search" placeholder="Search..." />

      <h3 class="text-sm font-medium text-gray-400">Required (no label)</h3>
      <KInput placeholder="Required field without label" required />

      <h3 class="text-sm font-medium text-gray-400">Disabled</h3>
      <KInput label="Disabled Input" placeholder="Cannot type here" disabled />

      <h3 class="text-sm font-medium text-gray-400">With error</h3>
      <KInput label="Username" placeholder="Choose a username" error="Username is already taken" />

      <h3 class="text-sm font-medium text-gray-400">With hint + required</h3>
      <KInput label="Full Name" placeholder="John Doe" hint="First and last name" required />
    </section>

    <!-- ════════════════════════════════════════════════ -->
    <!--  KInputMask                                      -->
    <!-- ════════════════════════════════════════════════ -->
    <section class="space-y-4">
      <h2 class="text-lg font-semibold">KInputMask</h2>

      <h3 class="text-sm font-medium text-gray-400">Pattern mask (masked value)</h3>
      <KInputMask
        v-model="maskedValue"
        label="Employee ID"
        placeholder="EMP-0000-0000"
        :mask="{ mask: 'EMP-0000-0000' }"
        hint="Format: EMP-0000-0000"
      />
      <p class="text-sm text-gray-500">Masked: {{ maskedValue }}</p>

      <h3 class="text-sm font-medium text-gray-400">unmask=true (raw value)</h3>
      <KInputMask
        v-model="unmaskedValue"
        label="SSN"
        placeholder="000-00-0000"
        :mask="{ mask: '000-00-0000' }"
        unmask
      />
      <p class="text-sm text-gray-500">Unmasked: {{ unmaskedValue }}</p>

      <h3 class="text-sm font-medium text-gray-400">Disabled</h3>
      <KInputMask
        label="Disabled Mask"
        placeholder="XX-0000"
        :mask="{ mask: 'aa-0000' }"
        disabled
      />

      <h3 class="text-sm font-medium text-gray-400">With error</h3>
      <KInputMask
        label="License Plate"
        placeholder="ABC-1234"
        :mask="{ mask: 'aaa-0000' }"
        error="Invalid license plate"
      />

      <h3 class="text-sm font-medium text-gray-400">Required</h3>
      <KInputMask
        label="Code"
        placeholder="000-000"
        :mask="{ mask: '000-000' }"
        required
      />
    </section>

    <!-- ════════════════════════════════════════════════ -->
    <!--  KInputPhone                                     -->
    <!-- ════════════════════════════════════════════════ -->
    <section class="space-y-4">
      <h2 class="text-lg font-semibold">KInputPhone</h2>

      <h3 class="text-sm font-medium text-gray-400">Default</h3>
      <KInputPhone v-model="phoneValue" label="Phone Number" placeholder="555-123-4567" />
      <p class="text-sm text-gray-500">Value: {{ phoneValue }}</p>

      <h3 class="text-sm font-medium text-gray-400">Disabled</h3>
      <KInputPhone label="Phone" placeholder="555-123-4567" disabled />

      <h3 class="text-sm font-medium text-gray-400">With error + required</h3>
      <KInputPhone label="Phone" placeholder="555-123-4567" error="Phone number is required" required />

      <h3 class="text-sm font-medium text-gray-400">With hint</h3>
      <KInputPhone label="Mobile" placeholder="555-123-4567" hint="US phone numbers only" />
    </section>

    <!-- ════════════════════════════════════════════════ -->
    <!--  KInputZip                                       -->
    <!-- ════════════════════════════════════════════════ -->
    <section class="space-y-4">
      <h2 class="text-lg font-semibold">KInputZip</h2>

      <h3 class="text-sm font-medium text-gray-400">Default</h3>
      <KInputZip v-model="zipValue" label="ZIP Code" placeholder="90210" />
      <p class="text-sm text-gray-500">Value: {{ zipValue }}</p>

      <h3 class="text-sm font-medium text-gray-400">Disabled</h3>
      <KInputZip label="ZIP Code" placeholder="90210" disabled />

      <h3 class="text-sm font-medium text-gray-400">With error</h3>
      <KInputZip label="ZIP Code" placeholder="90210" error="Invalid ZIP code" />

      <h3 class="text-sm font-medium text-gray-400">Required + hint</h3>
      <KInputZip label="ZIP Code" placeholder="90210" hint="5-digit or ZIP+4" required />
    </section>

    <!-- ════════════════════════════════════════════════ -->
    <!--  KInputNumber                                    -->
    <!-- ════════════════════════════════════════════════ -->
    <section class="space-y-4">
      <h2 class="text-lg font-semibold">KInputNumber</h2>

      <h3 class="text-sm font-medium text-gray-400">Default (USD hidden)</h3>
      <KInputNumber v-model="numberValue" label="Quantity" placeholder="0" />
      <p class="text-sm text-gray-500">Value: {{ numberValue }}</p>

      <h3 class="text-sm font-medium text-gray-400">Disabled</h3>
      <KInputNumber label="Amount" placeholder="0" disabled />

      <h3 class="text-sm font-medium text-gray-400">With error</h3>
      <KInputNumber label="Budget" placeholder="0" error="Budget must be positive" />

      <h3 class="text-sm font-medium text-gray-400">Required + hint</h3>
      <KInputNumber label="Score" placeholder="0" hint="Enter a number between 1-100" required />
    </section>

    <!-- ════════════════════════════════════════════════ -->
    <!--  KInputCurrency                                  -->
    <!-- ════════════════════════════════════════════════ -->
    <section class="space-y-4">
      <h2 class="text-lg font-semibold">KInputCurrency</h2>

      <h3 class="text-sm font-medium text-gray-400">Default (USD, symbol)</h3>
      <KInputCurrency v-model="currencyValue" label="Salary" placeholder="75,000" />
      <p class="text-sm text-gray-500">Value: {{ currencyValue }}</p>

      <h3 class="text-sm font-medium text-gray-400">EUR, narrowSymbol display</h3>
      <KInputCurrency
        v-model="currencyEUR"
        label="Price (EUR)"
        placeholder="1,000"
        currency="EUR"
        currency-display="narrowSymbol"
        locale="de-DE"
      />
      <p class="text-sm text-gray-500">Value: {{ currencyEUR }}</p>

      <h3 class="text-sm font-medium text-gray-400">Code display</h3>
      <KInputCurrency label="Amount" placeholder="0" currency="GBP" currency-display="code" />

      <h3 class="text-sm font-medium text-gray-400">Hidden symbol, no hide on focus</h3>
      <KInputCurrency
        label="Amount"
        placeholder="0"
        currency-display="hidden"
        :hide-currency-symbol-on-focus="false"
      />

      <h3 class="text-sm font-medium text-gray-400">Disabled</h3>
      <KInputCurrency label="Revenue" placeholder="0" disabled />

      <h3 class="text-sm font-medium text-gray-400">With error + required</h3>
      <KInputCurrency label="Budget" placeholder="0" error="Budget is required" required />

      <h3 class="text-sm font-medium text-gray-400">With hint</h3>
      <KInputCurrency label="Donation" placeholder="0" hint="Minimum $10" />
    </section>

    <!-- ════════════════════════════════════════════════ -->
    <!--  KInputFile                                      -->
    <!-- ════════════════════════════════════════════════ -->
    <section class="space-y-4">
      <h2 class="text-lg font-semibold">KInputFile</h2>

      <h3 class="text-sm font-medium text-gray-400">Single file</h3>
      <KInputFile label="Avatar" accept="image/*" hint="Upload a profile picture" />

      <h3 class="text-sm font-medium text-gray-400">Multiple files</h3>
      <KInputFile label="Documents" accept=".pdf,.doc,.docx" multiple hint="PDF or Word files" />

      <h3 class="text-sm font-medium text-gray-400">Multiple with maxFiles</h3>
      <KInputFile
        label="Photos"
        accept="image/*"
        multiple
        :max-files="3"
        hint="Up to 3 images"
      />

      <h3 class="text-sm font-medium text-gray-400">Disabled</h3>
      <KInputFile label="Uploads Disabled" disabled />

      <h3 class="text-sm font-medium text-gray-400">With error + required</h3>
      <KInputFile label="Resume" accept=".pdf" error="Please upload your resume" required />

      <h3 class="text-sm font-medium text-gray-400">No accept filter</h3>
      <KInputFile label="Any File" hint="All file types accepted" />
    </section>

    <!-- ════════════════════════════════════════════════ -->
    <!--  KSelect                                         -->
    <!-- ════════════════════════════════════════════════ -->
    <section class="space-y-4">
      <h2 class="text-lg font-semibold">KSelect</h2>

      <h3 class="text-sm font-medium text-gray-400">Single (local search)</h3>
      <KSelect
        v-model="selected"
        :options="countryOptions"
        option-value="value"
        option-label="label"
        label="Country"
        placeholder="Select a country"
        local
      />
      <p class="text-sm text-gray-500">Value: {{ selected }}</p>

      <h3 class="text-sm font-medium text-gray-400">Multiple</h3>
      <KSelect
        v-model="selectedMultiple"
        :options="departmentOptions"
        option-value="value"
        option-label="label"
        label="Departments"
        placeholder="Select departments"
        mode="multiple"
        local
      />
      <p class="text-sm text-gray-500">Value: {{ selectedMultiple }}</p>

      <h3 class="text-sm font-medium text-gray-400">Tags (with createOption)</h3>
      <KSelect
        v-model="selectedTags"
        :options="skillOptions"
        option-value="value"
        option-label="label"
        label="Skills"
        placeholder="Add skills"
        mode="tags"
        :create-option="true"
        local
      />
      <p class="text-sm text-gray-500">Value: {{ selectedTags }}</p>

      <h3 class="text-sm font-medium text-gray-400">Grouped (groupBy)</h3>
      <KSelect
        v-model="selectedGrouped"
        :options="groupedOptions"
        option-value="value"
        option-label="label"
        :group-by="(o: any) => o.category"
        label="Framework"
        placeholder="Select a framework"
        local
      />
      <p class="text-sm text-gray-500">Value: {{ selectedGrouped }}</p>

      <h3 class="text-sm font-medium text-gray-400">canDeselect</h3>
      <KSelect
        v-model="selectedDeselect"
        :options="countryOptions"
        option-value="value"
        option-label="label"
        label="Country (deselectable)"
        placeholder="Select or deselect"
        can-deselect
        local
      />
      <p class="text-sm text-gray-500">Value: {{ selectedDeselect }}</p>

      <h3 class="text-sm font-medium text-gray-400">disableSearch</h3>
      <KSelect
        v-model="selectedNoSearch"
        :options="countryOptions"
        option-value="value"
        option-label="label"
        label="Country (no search)"
        placeholder="Select a country"
        disable-search
        local
      />

      <h3 class="text-sm font-medium text-gray-400">hideClear</h3>
      <KSelect
        v-model="selectedHideClear"
        :options="countryOptions"
        option-value="value"
        option-label="label"
        label="Country (no clear)"
        placeholder="Select a country"
        hide-clear
        local
      />

      <h3 class="text-sm font-medium text-gray-400">objectValue</h3>
      <KSelect
        v-model="selectedObject"
        :options="countryOptions"
        option-value="value"
        option-label="label"
        label="Country (object value)"
        placeholder="Select a country"
        object-value
        local
      />
      <p class="text-sm text-gray-500">Value: {{ JSON.stringify(selectedObject) }}</p>

      <h3 class="text-sm font-medium text-gray-400">Primitive string options</h3>
      <KSelect
        :options="primitiveOptions"
        label="Fruit"
        placeholder="Pick a fruit"
        local
      />

      <h3 class="text-sm font-medium text-gray-400">Custom emptyText</h3>
      <KSelect
        :options="[]"
        label="Empty"
        placeholder="No options"
        empty-text="Nothing to show here"
        local
      />

      <h3 class="text-sm font-medium text-gray-400">Loading</h3>
      <KSelect
        :options="[]"
        label="Loading State"
        placeholder="Fetching options..."
        loading
        local
      />

      <h3 class="text-sm font-medium text-gray-400">Disabled</h3>
      <KSelect
        :options="countryOptions"
        option-value="value"
        option-label="label"
        label="Country (disabled)"
        placeholder="Select a country"
        disabled
        local
      />

      <h3 class="text-sm font-medium text-gray-400">With error + required</h3>
      <KSelect
        :options="countryOptions"
        option-value="value"
        option-label="label"
        label="Country"
        placeholder="Select a country"
        error="Country is required"
        required
        local
      />

      <h3 class="text-sm font-medium text-gray-400">With hint</h3>
      <KSelect
        :options="countryOptions"
        option-value="value"
        option-label="label"
        label="Country"
        placeholder="Select a country"
        hint="Where you currently reside"
        local
      />
    </section>

    <!-- ════════════════════════════════════════════════ -->
    <!--  KDatepicker                                     -->
    <!-- ════════════════════════════════════════════════ -->
    <section class="space-y-4">
      <h2 class="text-lg font-semibold">KDatepicker</h2>

      <h3 class="text-sm font-medium text-gray-400">Default (autoApply=true)</h3>
      <KDatepicker v-model="date" label="Date" placeholder="Pick a date" />
      <p class="text-sm text-gray-500">Value: {{ date }}</p>

      <h3 class="text-sm font-medium text-gray-400">autoApply=false</h3>
      <KDatepicker label="Date (confirm)" placeholder="Pick a date" :auto-apply="false" />

      <h3 class="text-sm font-medium text-gray-400">Disabled</h3>
      <KDatepicker label="Date (disabled)" placeholder="Pick a date" disabled />

      <h3 class="text-sm font-medium text-gray-400">With error</h3>
      <KDatepicker label="Start Date" placeholder="Pick a date" error="Start date is required" />

      <h3 class="text-sm font-medium text-gray-400">Required + hint</h3>
      <KDatepicker label="Birthday" placeholder="Pick your birthday" hint="Must be 18 or older" required />
    </section>

    <!-- ════════════════════════════════════════════════ -->
    <!--  KButton                                         -->
    <!-- ════════════════════════════════════════════════ -->
    <section class="space-y-4">
      <h2 class="text-lg font-semibold">KButton</h2>

      <h3 class="text-sm font-medium text-gray-400">All variants</h3>
      <div class="flex flex-wrap gap-2">
        <KButton variant="default" label="Default" />
        <KButton variant="primary" label="Primary" />
        <KButton variant="secondary" label="Secondary" />
        <KButton variant="success" label="Success" />
        <KButton variant="warning" label="Warning" />
        <KButton variant="danger" label="Danger" />
        <KButton variant="info" label="Info" />
        <KButton variant="outline" label="Outline" />
        <KButton variant="ghost" label="Ghost" />
      </div>

      <h3 class="text-sm font-medium text-gray-400">Sizes</h3>
      <div class="flex items-start flex-wrap gap-2">
        <KButton variant="primary" label="Small" size="sm" />
        <KButton variant="primary" label="Medium" size="md" />
        <KButton variant="primary" label="Large" size="lg" />
      </div>

      <h3 class="text-sm font-medium text-gray-400">Disabled (all variants)</h3>
      <div class="flex flex-wrap gap-2">
        <KButton variant="primary" label="Disabled" disabled />
        <KButton variant="outline" label="Disabled Outline" disabled />
        <KButton variant="ghost" label="Disabled Ghost" disabled />
      </div>

      <h3 class="text-sm font-medium text-gray-400">Loading</h3>
      <div class="flex flex-wrap gap-2">
        <KButton variant="primary" label="Loading" loading />
        <KButton variant="primary" label="Custom Label" loading loading-label="Saving..." />
      </div>

      <h3 class="text-sm font-medium text-gray-400">Button types</h3>
      <div class="flex flex-wrap gap-2">
        <KButton type="button" label="type=button" />
        <KButton type="submit" label="type=submit" />
        <KButton type="reset" label="type=reset" />
      </div>

      <h3 class="text-sm font-medium text-gray-400">As link (href)</h3>
      <KButton variant="primary" label="Visit Example" href="https://example.com" />

      <h3 class="text-sm font-medium text-gray-400">Link disabled</h3>
      <KButton variant="primary" label="Disabled Link" href="https://example.com" disabled />
    </section>

    <!-- ════════════════════════════════════════════════ -->
    <!--  KBadge                                          -->
    <!-- ════════════════════════════════════════════════ -->
    <section class="space-y-4">
      <h2 class="text-lg font-semibold">KBadge</h2>

      <h3 class="text-sm font-medium text-gray-400">All variants</h3>
      <div class="flex flex-wrap gap-2">
        <KBadge label="Default" />
        <KBadge variant="primary" label="Primary" />
        <KBadge variant="secondary" label="Secondary" />
        <KBadge variant="success" label="Success" />
        <KBadge variant="warning" label="Warning" />
        <KBadge variant="danger" label="Danger" />
        <KBadge variant="info" label="Info" />
        <KBadge variant="outline" label="Outline" />
        <KBadge variant="ghost" label="Ghost" />
      </div>

      <h3 class="text-sm font-medium text-gray-400">Sizes</h3>
      <div class="flex items-start flex-wrap gap-2">
        <KBadge variant="primary" label="Small" size="sm" />
        <KBadge variant="primary" label="Medium" size="md" />
        <KBadge variant="primary" label="Large" size="lg" />
      </div>

      <h3 class="text-sm font-medium text-gray-400">Pill shape</h3>
      <div class="flex flex-wrap gap-2">
        <KBadge label="Default Pill" pill />
        <KBadge variant="primary" label="Primary Pill" pill />
        <KBadge variant="success" label="Success Pill" pill />
      </div>

      <h3 class="text-sm font-medium text-gray-400">Dot indicator</h3>
      <div class="flex flex-wrap gap-2">
        <KBadge variant="primary" label="Active" dot />
        <KBadge variant="success" label="Online" dot />
        <KBadge variant="danger" label="Error" dot />
        <KBadge variant="warning" label="Pending" dot />
      </div>

      <h3 class="text-sm font-medium text-gray-400">Removable</h3>
      <div class="flex flex-wrap gap-2">
        <KBadge variant="primary" label="Tag 1" removable />
        <KBadge variant="success" label="Tag 2" removable remove-label="Delete tag 2" />
      </div>

      <h3 class="text-sm font-medium text-gray-400">Combined: pill + dot + removable</h3>
      <div class="flex flex-wrap gap-2">
        <KBadge variant="warning" label="Warning" pill dot removable />
        <KBadge variant="info" label="Note" pill dot removable />
      </div>

      <h3 class="text-sm font-medium text-gray-400">With role</h3>
      <KBadge variant="danger" label="3 errors" role="status" />
    </section>

    <!-- ════════════════════════════════════════════════ -->
    <!--  KAlert                                          -->
    <!-- ════════════════════════════════════════════════ -->
    <section class="space-y-4">
      <h2 class="text-lg font-semibold">KAlert</h2>

      <h3 class="text-sm font-medium text-gray-400">All variants</h3>
      <KAlert title="Default" description="This is a default alert." />
      <KAlert variant="success" title="Success" description="Operation completed successfully." />
      <KAlert variant="warning" title="Warning" description="Please review this carefully." />
      <KAlert variant="danger" title="Danger" description="Something went wrong." />
      <KAlert variant="info" title="Info" description="Here is some useful information." />

      <h3 class="text-sm font-medium text-gray-400">Dismissible</h3>
      <KAlert variant="success" title="Dismissible" description="You can close this alert." dismissible />

      <h3 class="text-sm font-medium text-gray-400">Dismissible with custom closeLabel</h3>
      <KAlert variant="warning" title="Custom Close" description="Custom close button label." dismissible close-label="Dismiss this alert" />

      <h3 class="text-sm font-medium text-gray-400">Title only</h3>
      <KAlert variant="info" title="Just a title, no description" />

      <h3 class="text-sm font-medium text-gray-400">Description only</h3>
      <KAlert variant="danger" description="Just a description, no title." />
    </section>

    <!-- ════════════════════════════════════════════════ -->
    <!--  KLoading                                        -->
    <!-- ════════════════════════════════════════════════ -->
    <section class="space-y-4">
      <h2 class="text-lg font-semibold">KLoading</h2>

      <h3 class="text-sm font-medium text-gray-400">Sizes</h3>
      <div class="flex items-center gap-4">
        <KLoading size="xs" />
        <KLoading size="sm" />
        <KLoading size="md" />
        <KLoading size="lg" />
      </div>

      <h3 class="text-sm font-medium text-gray-400">Colors</h3>
      <div class="flex items-center gap-4">
        <KLoading size="md" color="current" />
        <KLoading size="md" color="primary" />
        <KLoading size="md" color="muted" />
      </div>

      <h3 class="text-sm font-medium text-gray-400">With custom label</h3>
      <KLoading size="sm" color="primary" label="Fetching data..." />

      <h3 class="text-sm font-medium text-gray-400">Overlay</h3>
      <div class="relative h-32 w-full rounded-lg border border-slate-200 bg-white p-4">
        <p class="text-sm text-gray-500">Content underneath the overlay</p>
        <KLoading size="lg" color="primary" label="Loading content..." overlay />
      </div>
    </section>
  </div>
</template>
