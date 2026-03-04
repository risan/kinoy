<script setup lang="ts">
import { ref } from 'vue';
import { useForm } from 'vee-validate';
import * as yup from 'yup';
import type { AddressData } from '../src/types/form';

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
const placeValue = ref('');
const placeStreetOnly = ref('');
const placeApiKey = ref('');
const placeAddress = ref<AddressData | null>(null);

function onSelectAddress(data: AddressData) {
  placeAddress.value = data;
}

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
  phone: yup
    .string()
    .required('Phone number is required')
    .matches(/^\d{3}-\d{3}-\d{4}$/, 'Format: 555-123-4567'),
  salary: yup.number().required('Expected salary is required'),
  zipCode: yup
    .string()
    .required('ZIP code is required')
    .matches(/^\d{5}(-\d{4})?$/, 'Format: 90210 or 90210-1234'),
  country: yup.string().required('Country is required'),
  departments: yup
    .array()
    .min(1, 'Select at least one department')
    .required('Department is required'),
  skills: yup.array().min(1, 'Add at least one skill').required('Skills are required'),
  startDate: yup.date().required('Start date is required'),
  employeeId: yup
    .string()
    .required('Employee ID is required')
    .matches(/^EMP-\d{4}-\d{4}$/, 'Format: EMP-0000-0000'),
  photos: yup
    .array()
    .required('Upload at least one photo')
    .min(1, 'Upload at least one photo')
    .max(3, 'Maximum 3 photos allowed')
    .test(
      'fileSize',
      'Each file must be under 5 MB',
      (files) => !files || files.every((f: File) => f.size <= 5 * 1024 * 1024),
    )
    .test(
      'fileType',
      'Only image files are allowed',
      (files) => !files || files.every((f: File) => f.type.startsWith('image/')),
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
    <h1 class="text-2xl font-bold">JBW UI Dev Playground</h1>

    <form class="space-y-4" novalidate @submit.prevent="onSubmit">
      <h2 class="text-lg font-semibold">New Employee Registration</h2>

      <JInput name="fullName" label="Full Name" placeholder="John Doe" required />

      <JInput name="email" label="Email Address" placeholder="john.doe@company.com" required />

      <JInputPhone name="phone" label="Phone Number" placeholder="555-123-4567" required />

      <JInputCurrency name="salary" label="Expected Salary" placeholder="75,000" required />

      <JInputZip name="zipCode" label="ZIP Code" placeholder="90210" required />

      <JSelect
        name="country"
        :options="countryOptions"
        option-value="value"
        option-label="label"
        label="Country"
        placeholder="Select your country"
        local
        required
      />

      <JSelect
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

      <JSelect
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

      <JDatepicker name="startDate" label="Start Date" placeholder="Pick a start date" required />

      <JInputMask
        name="employeeId"
        label="Employee ID"
        placeholder="EMP-0000-0000"
        :mask="{ mask: 'EMP-0000-0000' }"
        required
      />

      <JInputFile
        name="photos"
        label="Photos"
        accept="image/*"
        :max-files="3"
        multiple
        hint="Up to 3 images, max 5 MB each"
        required
      />

      <JButton type="submit" label="Register Employee" />

      <p v-if="submitted" class="text-sm text-green-600">Employee registered successfully!</p>
    </form>

    <hr class="border-slate-200" />

    <!-- ════════════════════════════════════════════════ -->
    <!--  JInput                                          -->
    <!-- ════════════════════════════════════════════════ -->
    <section class="space-y-4">
      <h2 class="text-lg font-semibold">JInput</h2>

      <h3 class="text-sm font-medium text-gray-400">Default (text)</h3>
      <JInput v-model="text" label="Name" placeholder="Enter your name" hint="Your full name" />
      <p class="text-sm text-gray-500">Value: {{ text }}</p>

      <h3 class="text-sm font-medium text-gray-400">type="email"</h3>
      <JInput v-model="emailText" type="email" label="Email" placeholder="john@example.com" />

      <h3 class="text-sm font-medium text-gray-400">type="password"</h3>
      <JInput
        v-model="passwordText"
        type="password"
        label="Password"
        placeholder="Enter password"
      />

      <h3 class="text-sm font-medium text-gray-400">type="search"</h3>
      <JInput v-model="searchText" type="search" label="Search" placeholder="Search..." />

      <h3 class="text-sm font-medium text-gray-400">Required (no label)</h3>
      <JInput placeholder="Required field without label" required />

      <h3 class="text-sm font-medium text-gray-400">Disabled</h3>
      <JInput label="Disabled Input" placeholder="Cannot type here" disabled />

      <h3 class="text-sm font-medium text-gray-400">With error</h3>
      <JInput label="Username" placeholder="Choose a username" error="Username is already taken" />

      <h3 class="text-sm font-medium text-gray-400">With hint + required</h3>
      <JInput label="Full Name" placeholder="John Doe" hint="First and last name" required />
    </section>

    <!-- ════════════════════════════════════════════════ -->
    <!--  JInputMask                                      -->
    <!-- ════════════════════════════════════════════════ -->
    <section class="space-y-4">
      <h2 class="text-lg font-semibold">JInputMask</h2>

      <h3 class="text-sm font-medium text-gray-400">Pattern mask (masked value)</h3>
      <JInputMask
        v-model="maskedValue"
        label="Employee ID"
        placeholder="EMP-0000-0000"
        :mask="{ mask: 'EMP-0000-0000' }"
        hint="Format: EMP-0000-0000"
      />
      <p class="text-sm text-gray-500">Masked: {{ maskedValue }}</p>

      <h3 class="text-sm font-medium text-gray-400">unmask=true (raw value)</h3>
      <JInputMask
        v-model="unmaskedValue"
        label="SSN"
        placeholder="000-00-0000"
        :mask="{ mask: '000-00-0000' }"
        unmask
      />
      <p class="text-sm text-gray-500">Unmasked: {{ unmaskedValue }}</p>

      <h3 class="text-sm font-medium text-gray-400">Disabled</h3>
      <JInputMask
        label="Disabled Mask"
        placeholder="XX-0000"
        :mask="{ mask: 'aa-0000' }"
        disabled
      />

      <h3 class="text-sm font-medium text-gray-400">With error</h3>
      <JInputMask
        label="License Plate"
        placeholder="ABC-1234"
        :mask="{ mask: 'aaa-0000' }"
        error="Invalid license plate"
      />

      <h3 class="text-sm font-medium text-gray-400">Required</h3>
      <JInputMask label="Code" placeholder="000-000" :mask="{ mask: '000-000' }" required />
    </section>

    <!-- ════════════════════════════════════════════════ -->
    <!--  JInputPhone                                     -->
    <!-- ════════════════════════════════════════════════ -->
    <section class="space-y-4">
      <h2 class="text-lg font-semibold">JInputPhone</h2>

      <h3 class="text-sm font-medium text-gray-400">Default</h3>
      <JInputPhone v-model="phoneValue" label="Phone Number" placeholder="555-123-4567" />
      <p class="text-sm text-gray-500">Value: {{ phoneValue }}</p>

      <h3 class="text-sm font-medium text-gray-400">Disabled</h3>
      <JInputPhone label="Phone" placeholder="555-123-4567" disabled />

      <h3 class="text-sm font-medium text-gray-400">With error + required</h3>
      <JInputPhone
        label="Phone"
        placeholder="555-123-4567"
        error="Phone number is required"
        required
      />

      <h3 class="text-sm font-medium text-gray-400">With hint</h3>
      <JInputPhone label="Mobile" placeholder="555-123-4567" hint="US phone numbers only" />
    </section>

    <!-- ════════════════════════════════════════════════ -->
    <!--  JInputZip                                       -->
    <!-- ════════════════════════════════════════════════ -->
    <section class="space-y-4">
      <h2 class="text-lg font-semibold">JInputZip</h2>

      <h3 class="text-sm font-medium text-gray-400">Default</h3>
      <JInputZip v-model="zipValue" label="ZIP Code" placeholder="90210" />
      <p class="text-sm text-gray-500">Value: {{ zipValue }}</p>

      <h3 class="text-sm font-medium text-gray-400">Disabled</h3>
      <JInputZip label="ZIP Code" placeholder="90210" disabled />

      <h3 class="text-sm font-medium text-gray-400">With error</h3>
      <JInputZip label="ZIP Code" placeholder="90210" error="Invalid ZIP code" />

      <h3 class="text-sm font-medium text-gray-400">Required + hint</h3>
      <JInputZip label="ZIP Code" placeholder="90210" hint="5-digit or ZIP+4" required />
    </section>

    <!-- ════════════════════════════════════════════════ -->
    <!--  JInputNumber                                    -->
    <!-- ════════════════════════════════════════════════ -->
    <section class="space-y-4">
      <h2 class="text-lg font-semibold">JInputNumber</h2>

      <h3 class="text-sm font-medium text-gray-400">Default (USD hidden)</h3>
      <JInputNumber v-model="numberValue" label="Quantity" placeholder="0" />
      <p class="text-sm text-gray-500">Value: {{ numberValue }}</p>

      <h3 class="text-sm font-medium text-gray-400">Disabled</h3>
      <JInputNumber label="Amount" placeholder="0" disabled />

      <h3 class="text-sm font-medium text-gray-400">With error</h3>
      <JInputNumber label="Budget" placeholder="0" error="Budget must be positive" />

      <h3 class="text-sm font-medium text-gray-400">Required + hint</h3>
      <JInputNumber label="Score" placeholder="0" hint="Enter a number between 1-100" required />
    </section>

    <!-- ════════════════════════════════════════════════ -->
    <!--  JInputCurrency                                  -->
    <!-- ════════════════════════════════════════════════ -->
    <section class="space-y-4">
      <h2 class="text-lg font-semibold">JInputCurrency</h2>

      <h3 class="text-sm font-medium text-gray-400">Default (USD, symbol)</h3>
      <JInputCurrency v-model="currencyValue" label="Salary" placeholder="75,000" />
      <p class="text-sm text-gray-500">Value: {{ currencyValue }}</p>

      <h3 class="text-sm font-medium text-gray-400">EUR, narrowSymbol display</h3>
      <JInputCurrency
        v-model="currencyEUR"
        label="Price (EUR)"
        placeholder="1,000"
        currency="EUR"
        currency-display="narrowSymbol"
        locale="de-DE"
      />
      <p class="text-sm text-gray-500">Value: {{ currencyEUR }}</p>

      <h3 class="text-sm font-medium text-gray-400">Code display</h3>
      <JInputCurrency label="Amount" placeholder="0" currency="GBP" currency-display="code" />

      <h3 class="text-sm font-medium text-gray-400">Hidden symbol, no hide on focus</h3>
      <JInputCurrency
        label="Amount"
        placeholder="0"
        currency-display="hidden"
        :hide-currency-symbol-on-focus="false"
      />

      <h3 class="text-sm font-medium text-gray-400">Disabled</h3>
      <JInputCurrency label="Revenue" placeholder="0" disabled />

      <h3 class="text-sm font-medium text-gray-400">With error + required</h3>
      <JInputCurrency label="Budget" placeholder="0" error="Budget is required" required />

      <h3 class="text-sm font-medium text-gray-400">With hint</h3>
      <JInputCurrency label="Donation" placeholder="0" hint="Minimum $10" />
    </section>

    <!-- ════════════════════════════════════════════════ -->
    <!--  JInputFile                                      -->
    <!-- ════════════════════════════════════════════════ -->
    <section class="space-y-4">
      <h2 class="text-lg font-semibold">JInputFile</h2>

      <h3 class="text-sm font-medium text-gray-400">Single file</h3>
      <JInputFile label="Avatar" accept="image/*" hint="Upload a profile picture" />

      <h3 class="text-sm font-medium text-gray-400">Multiple files</h3>
      <JInputFile label="Documents" accept=".pdf,.doc,.docx" multiple hint="PDF or Word files" />

      <h3 class="text-sm font-medium text-gray-400">Multiple with maxFiles</h3>
      <JInputFile label="Photos" accept="image/*" multiple :max-files="3" hint="Up to 3 images" />

      <h3 class="text-sm font-medium text-gray-400">Disabled</h3>
      <JInputFile label="Uploads Disabled" disabled />

      <h3 class="text-sm font-medium text-gray-400">With error + required</h3>
      <JInputFile label="Resume" accept=".pdf" error="Please upload your resume" required />

      <h3 class="text-sm font-medium text-gray-400">No accept filter</h3>
      <JInputFile label="Any File" hint="All file types accepted" />
    </section>

    <!-- ════════════════════════════════════════════════ -->
    <!--  JInputPlace                                      -->
    <!-- ════════════════════════════════════════════════ -->
    <section class="space-y-4">
      <h2 class="text-lg font-semibold">JInputPlace</h2>

      <JInput
        v-model="placeApiKey"
        label="Google Maps API Key"
        placeholder="Paste your API key here"
        hint="Required for Places autocomplete to work"
      />

      <h3 class="text-sm font-medium text-gray-400">Default (full address)</h3>
      <JInputPlace
        v-model="placeValue"
        :api-key="placeApiKey"
        label="Address"
        placeholder="Start typing an address..."
        @select-address="onSelectAddress"
      />
      <p class="text-sm text-gray-500">Value: {{ placeValue }}</p>
      <p v-if="placeAddress" class="text-sm text-gray-500">
        Address: {{ JSON.stringify(placeAddress) }}
      </p>

      <h3 class="text-sm font-medium text-gray-400">streetAddressOnly</h3>
      <JInputPlace
        v-model="placeStreetOnly"
        :api-key="placeApiKey"
        label="Street Address"
        placeholder="Start typing..."
        street-address-only
      />
      <p class="text-sm text-gray-500">Value: {{ placeStreetOnly }}</p>

      <h3 class="text-sm font-medium text-gray-400">Disabled</h3>
      <JInputPlace label="Address (disabled)" placeholder="Cannot type here" disabled />

      <h3 class="text-sm font-medium text-gray-400">With error + required</h3>
      <JInputPlace
        :api-key="placeApiKey"
        label="Address"
        placeholder="Start typing..."
        error="Address is required"
        required
      />

      <h3 class="text-sm font-medium text-gray-400">With hint</h3>
      <JInputPlace
        :api-key="placeApiKey"
        label="Shipping Address"
        placeholder="Start typing..."
        hint="US addresses only"
        :included-region-codes="['us']"
      />
    </section>

    <!-- ════════════════════════════════════════════════ -->
    <!--  JSelect                                         -->
    <!-- ════════════════════════════════════════════════ -->
    <section class="space-y-4">
      <h2 class="text-lg font-semibold">JSelect</h2>

      <h3 class="text-sm font-medium text-gray-400">Single (local search)</h3>
      <JSelect
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
      <JSelect
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
      <JSelect
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
      <JSelect
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
      <JSelect
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
      <JSelect
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
      <JSelect
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
      <JSelect
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
      <JSelect :options="primitiveOptions" label="Fruit" placeholder="Pick a fruit" local />

      <h3 class="text-sm font-medium text-gray-400">Custom emptyText</h3>
      <JSelect
        :options="[]"
        label="Empty"
        placeholder="No options"
        empty-text="Nothing to show here"
        local
      />

      <h3 class="text-sm font-medium text-gray-400">Loading</h3>
      <JSelect
        :options="[]"
        label="Loading State"
        placeholder="Fetching options..."
        loading
        local
      />

      <h3 class="text-sm font-medium text-gray-400">Disabled</h3>
      <JSelect
        :options="countryOptions"
        option-value="value"
        option-label="label"
        label="Country (disabled)"
        placeholder="Select a country"
        disabled
        local
      />

      <h3 class="text-sm font-medium text-gray-400">With error + required</h3>
      <JSelect
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
      <JSelect
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
    <!--  JDatepicker                                     -->
    <!-- ════════════════════════════════════════════════ -->
    <section class="space-y-4">
      <h2 class="text-lg font-semibold">JDatepicker</h2>

      <h3 class="text-sm font-medium text-gray-400">Default (autoApply=true)</h3>
      <JDatepicker v-model="date" label="Date" placeholder="Pick a date" />
      <p class="text-sm text-gray-500">Value: {{ date }}</p>

      <h3 class="text-sm font-medium text-gray-400">autoApply=false</h3>
      <JDatepicker label="Date (confirm)" placeholder="Pick a date" :auto-apply="false" />

      <h3 class="text-sm font-medium text-gray-400">Disabled</h3>
      <JDatepicker label="Date (disabled)" placeholder="Pick a date" disabled />

      <h3 class="text-sm font-medium text-gray-400">With error</h3>
      <JDatepicker label="Start Date" placeholder="Pick a date" error="Start date is required" />

      <h3 class="text-sm font-medium text-gray-400">Required + hint</h3>
      <JDatepicker
        label="Birthday"
        placeholder="Pick your birthday"
        hint="Must be 18 or older"
        required
      />
    </section>

    <!-- ════════════════════════════════════════════════ -->
    <!--  JButton                                         -->
    <!-- ════════════════════════════════════════════════ -->
    <section class="space-y-4">
      <h2 class="text-lg font-semibold">JButton</h2>

      <h3 class="text-sm font-medium text-gray-400">All variants</h3>
      <div class="flex flex-wrap gap-2">
        <JButton variant="default" label="Default" />
        <JButton variant="primary" label="Primary" />
        <JButton variant="secondary" label="Secondary" />
        <JButton variant="success" label="Success" />
        <JButton variant="warning" label="Warning" />
        <JButton variant="danger" label="Danger" />
        <JButton variant="info" label="Info" />
        <JButton variant="outline" label="Outline" />
        <JButton variant="ghost" label="Ghost" />
      </div>

      <h3 class="text-sm font-medium text-gray-400">Sizes</h3>
      <div class="flex items-start flex-wrap gap-2">
        <JButton variant="primary" label="Small" size="sm" />
        <JButton variant="primary" label="Medium" size="md" />
        <JButton variant="primary" label="Large" size="lg" />
      </div>

      <h3 class="text-sm font-medium text-gray-400">Disabled (all variants)</h3>
      <div class="flex flex-wrap gap-2">
        <JButton variant="primary" label="Disabled" disabled />
        <JButton variant="outline" label="Disabled Outline" disabled />
        <JButton variant="ghost" label="Disabled Ghost" disabled />
      </div>

      <h3 class="text-sm font-medium text-gray-400">Loading</h3>
      <div class="flex flex-wrap gap-2">
        <JButton variant="primary" label="Loading" loading />
        <JButton variant="primary" label="Custom Label" loading loading-label="Saving..." />
      </div>

      <h3 class="text-sm font-medium text-gray-400">Button types</h3>
      <div class="flex flex-wrap gap-2">
        <JButton type="button" label="type=button" />
        <JButton type="submit" label="type=submit" />
        <JButton type="reset" label="type=reset" />
      </div>

      <h3 class="text-sm font-medium text-gray-400">As link (href)</h3>
      <JButton variant="primary" label="Visit Example" href="https://example.com" />

      <h3 class="text-sm font-medium text-gray-400">Link disabled</h3>
      <JButton variant="primary" label="Disabled Link" href="https://example.com" disabled />
    </section>

    <!-- ════════════════════════════════════════════════ -->
    <!--  JBadge                                          -->
    <!-- ════════════════════════════════════════════════ -->
    <section class="space-y-4">
      <h2 class="text-lg font-semibold">JBadge</h2>

      <h3 class="text-sm font-medium text-gray-400">All variants</h3>
      <div class="flex flex-wrap gap-2">
        <JBadge label="Default" />
        <JBadge variant="primary" label="Primary" />
        <JBadge variant="secondary" label="Secondary" />
        <JBadge variant="success" label="Success" />
        <JBadge variant="warning" label="Warning" />
        <JBadge variant="danger" label="Danger" />
        <JBadge variant="info" label="Info" />
        <JBadge variant="outline" label="Outline" />
        <JBadge variant="ghost" label="Ghost" />
      </div>

      <h3 class="text-sm font-medium text-gray-400">Sizes</h3>
      <div class="flex items-start flex-wrap gap-2">
        <JBadge variant="primary" label="Small" size="sm" />
        <JBadge variant="primary" label="Medium" size="md" />
        <JBadge variant="primary" label="Large" size="lg" />
      </div>

      <h3 class="text-sm font-medium text-gray-400">Pill shape</h3>
      <div class="flex flex-wrap gap-2">
        <JBadge label="Default Pill" pill />
        <JBadge variant="primary" label="Primary Pill" pill />
        <JBadge variant="success" label="Success Pill" pill />
      </div>

      <h3 class="text-sm font-medium text-gray-400">Dot indicator</h3>
      <div class="flex flex-wrap gap-2">
        <JBadge variant="primary" label="Active" dot />
        <JBadge variant="success" label="Online" dot />
        <JBadge variant="danger" label="Error" dot />
        <JBadge variant="warning" label="Pending" dot />
      </div>

      <h3 class="text-sm font-medium text-gray-400">Removable</h3>
      <div class="flex flex-wrap gap-2">
        <JBadge variant="primary" label="Tag 1" removable />
        <JBadge variant="success" label="Tag 2" removable remove-label="Delete tag 2" />
      </div>

      <h3 class="text-sm font-medium text-gray-400">Combined: pill + dot + removable</h3>
      <div class="flex flex-wrap gap-2">
        <JBadge variant="warning" label="Warning" pill dot removable />
        <JBadge variant="info" label="Note" pill dot removable />
      </div>

      <h3 class="text-sm font-medium text-gray-400">With role</h3>
      <JBadge variant="danger" label="3 errors" role="status" />
    </section>

    <!-- ════════════════════════════════════════════════ -->
    <!--  JAlert                                          -->
    <!-- ════════════════════════════════════════════════ -->
    <section class="space-y-4">
      <h2 class="text-lg font-semibold">JAlert</h2>

      <h3 class="text-sm font-medium text-gray-400">All variants</h3>
      <JAlert title="Default" description="This is a default alert." />
      <JAlert variant="success" title="Success" description="Operation completed successfully." />
      <JAlert variant="warning" title="Warning" description="Please review this carefully." />
      <JAlert variant="danger" title="Danger" description="Something went wrong." />
      <JAlert variant="info" title="Info" description="Here is some useful information." />

      <h3 class="text-sm font-medium text-gray-400">Dismissible</h3>
      <JAlert
        variant="success"
        title="Dismissible"
        description="You can close this alert."
        dismissible
      />

      <h3 class="text-sm font-medium text-gray-400">Dismissible with custom closeLabel</h3>
      <JAlert
        variant="warning"
        title="Custom Close"
        description="Custom close button label."
        dismissible
        close-label="Dismiss this alert"
      />

      <h3 class="text-sm font-medium text-gray-400">Title only</h3>
      <JAlert variant="info" title="Just a title, no description" />

      <h3 class="text-sm font-medium text-gray-400">Description only</h3>
      <JAlert variant="danger" description="Just a description, no title." />
    </section>

    <!-- ════════════════════════════════════════════════ -->
    <!--  JLoading                                        -->
    <!-- ════════════════════════════════════════════════ -->
    <section class="space-y-4">
      <h2 class="text-lg font-semibold">JLoading</h2>

      <h3 class="text-sm font-medium text-gray-400">Sizes</h3>
      <div class="flex items-center gap-4">
        <JLoading size="xs" />
        <JLoading size="sm" />
        <JLoading size="md" />
        <JLoading size="lg" />
      </div>

      <h3 class="text-sm font-medium text-gray-400">Colors</h3>
      <div class="flex items-center gap-4">
        <JLoading size="md" color="current" />
        <JLoading size="md" color="primary" />
        <JLoading size="md" color="muted" />
      </div>

      <h3 class="text-sm font-medium text-gray-400">With custom label</h3>
      <JLoading size="sm" color="primary" label="Fetching data..." />

      <h3 class="text-sm font-medium text-gray-400">Overlay</h3>
      <div class="relative h-32 w-full rounded-lg border border-slate-200 bg-white p-4">
        <p class="text-sm text-gray-500">Content underneath the overlay</p>
        <JLoading size="lg" color="primary" label="Loading content..." overlay />
      </div>
    </section>
  </div>
</template>
