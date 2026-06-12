import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axiosClient from "../utils/axiosClient";
import { useNavigate, useParams } from "react-router";
import {
  Save,
  Plus,
  Trash2,
  Code2,
  Beaker,
  FileText,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Tags,
  Lightbulb,
  Edit3,
} from "lucide-react";


// Exact match with Backend Tags Enum
const TAG_OPTIONS = [
  "array",
  "string",
  "hashmap",
  "hashset",
  "linkedList",
  "stack",
  "queue",
  "heap",
  "priorityQueue",
  "tree",
  "binaryTree",
  "binarySearchTree",
  "trie",
  "graph",
  "dfs",
  "bfs",
  "topologicalSort",
  "shortestPath",
  "unionFind",
  "dynamicProgramming",
  "greedy",
  "backtracking",
  "divideAndConquer",
  "binarySearch",
  "twoPointers",
  "slidingWindow",
  "bitManipulation",
  "math",
  "geometry",
  "recursion",
  "sorting",
  "matrix",
  "prefixSum",
  "monotonicStack",
  "gameTheory",
];

// Zod schema matching the Mongoose schema exactly
const problemSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title is too long"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  difficulty: z.enum(["easy", "medium", "hard"], {
    errorMap: () => ({ message: "Select a difficulty" }),
  }),
  tags: z.array(z.string()).min(1, "Select at least one tag"),
  companies: z.string().optional(),
  constraints: z
    .array(z.object({ value: z.string().min(1, "Constraint cannot be empty") }))
    .min(1, "Add at least one constraint"),
  hints: z.array(z.object({ value: z.string() })).optional(),
  visibleTestCases: z
    .array(
      z.object({
        input: z.string().min(1, "Input required"),
        output: z.string().min(1, "Output required"),
        explanation: z.string().min(1, "Explanation required"),
      }),
    )
    .min(1, "At least one visible test case is required"),
  hiddenTestCases: z
    .array(
      z.object({
        input: z.string().min(1, "Input required"),
        output: z.string().min(1, "Output required"),
      }),
    )
    .min(1, "At least one hidden test case is required"),
  starterCode: z
    .array(
      z.object({
        language: z.enum(["cpp", "java", "python", "javascript"]),
        initialCode: z.string().min(1, "Starter code required"),
      }),
    )
    .length(4),
  referenceSolution: z
    .array(
      z.object({
        language: z.enum(["cpp", "java", "python", "javascript"]),
        completeCode: z.string().min(1, "Reference solution required"),
      }),
    )
    .length(4),
});

function EditProblem() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [isPageLoading, setIsPageLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeLangTab, setActiveLangTab] = useState(0);
  const [serverError, setServerError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const LANGUAGES = ["cpp", "java", "python", "javascript"];

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
  } = useForm({
    resolver: zodResolver(problemSchema),
    defaultValues: {
      tags: [],
      constraints: [{ value: "" }],
      hints: [],
      visibleTestCases: [{ input: "", output: "", explanation: "" }],
      hiddenTestCases: [{ input: "", output: "" }],
      starterCode: LANGUAGES.map((lang) => ({
        language: lang,
        initialCode: "",
      })),
      referenceSolution: LANGUAGES.map((lang) => ({
        language: lang,
        completeCode: "",
      })),
    },
  });

  const selectedTags = watch("tags");

  const {
    fields: visibleFields,
    append: appendVisible,
    remove: removeVisible,
  } = useFieldArray({ control, name: "visibleTestCases" });
  const {
    fields: hiddenFields,
    append: appendHidden,
    remove: removeHidden,
  } = useFieldArray({ control, name: "hiddenTestCases" });
  const {
    fields: constraintFields,
    append: appendConstraint,
    remove: removeConstraint,
  } = useFieldArray({ control, name: "constraints" });
  const {
    fields: hintFields,
    append: appendHint,
    remove: removeHint,
  } = useFieldArray({ control, name: "hints" });

  // Fetch problem data on mount
  useEffect(() => {
    const fetchProblemData = async () => {
      try {
        const res = await axiosClient.get(`/admin/getProblem/${id}`);
        const prob = res.data;

        // Transform backend data to match react-hook-form schema structure
        reset({
          title: prob.title,
          description: prob.description,
          difficulty: prob.difficulty,
          tags: prob.tags || [],
          companies: prob.companies ? prob.companies.join(", ") : "",
          constraints: prob.constraints
            ? prob.constraints.map((c) => ({ value: c }))
            : [{ value: "" }],
          hints: prob.hints ? prob.hints.map((h) => ({ value: h })) : [],
          visibleTestCases: prob.visibleTestCases || [
            { input: "", output: "", explanation: "" },
          ],
          hiddenTestCases: prob.hiddenTestCases || [{ input: "", output: "" }],

          // Sort languages to ensure they match our ['cpp', 'java', 'python', 'javascript'] order exactly
          starterCode: LANGUAGES.map((lang) => {
            const found = prob.starterCode?.find((sc) => sc.language === lang);
            return found || { language: lang, initialCode: "" };
          }),
          referenceSolution: LANGUAGES.map((lang) => {
            const found = prob.referenceSolution?.find(
              (rs) => rs.language === lang,
            );
            return found || { language: lang, completeCode: "" };
          }),
        });
      } catch (error) {
        setServerError(
          "Failed to fetch problem details. It may have been deleted.",
        );
      } finally {
        setIsPageLoading(false);
      }
    };

    if (id) fetchProblemData();
  }, [id, reset]);

  const toggleTag = (tag) => {
    const currentTags = selectedTags || [];
    if (currentTags.includes(tag)) {
      setValue(
        "tags",
        currentTags.filter((t) => t !== tag),
        { shouldValidate: true },
      );
    } else {
      setValue("tags", [...currentTags, tag], { shouldValidate: true });
    }
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setServerError("");
    setSuccessMessage("");

    try {
      // Transform data back to backend schema format
      const formattedData = {
        ...data,
        constraints: data.constraints.map((c) => c.value),
        hints: data.hints
          ? data.hints.map((h) => h.value).filter((h) => h.trim() !== "")
          : [],
        companies: data.companies
          ? data.companies
              .split(",")
              .map((c) => c.trim())
              .filter(Boolean)
          : [],
      };

      const response = await axiosClient.put(
        `/problem/update/${id}`,
        formattedData,
      );

      // Blue themed success message for Update
      setSuccessMessage("Problem details updated successfully! Redirecting...");
      window.scrollTo({ top: 0, behavior: "smooth" });

      setTimeout(() => {
        navigate(`/problem/${id}`);
      }, 2000);
    } catch (error) {
      setServerError(
        error.response?.data ||
          error.message ||
          "An error occurred during update.",
      );
      window.scrollTo({ top: 0, behavior: "smooth" });
      setIsSubmitting(false);
    }
  };

  const onError = (formErrors) => {
        console.log("Validation Errors:", formErrors); // This will log exactly what is missing in your browser console
        setServerError("Validation failed! Please check all fields, including hidden Language Tabs, to ensure no required fields are empty.");
        window.scrollTo({ top: 0, behavior: "smooth" });
    };


  // Full-page loading state while fetching data
  if (isPageLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <span className="loading loading-spinner loading-lg text-blue-500"></span>
        <p className="text-zinc-400 font-medium">Fetching problem data...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 font-sans text-white pb-20 relative animate-in fade-in duration-500">
      {/* ── UPDATE HEADER (Blue Theme) ── */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.15)]">
            <Edit3 size={24} strokeWidth={2.5} />
          </div>
          <h1 className="font-display text-3xl font-bold tracking-tight">
            Edit Problem
          </h1>
        </div>
        <p className="text-blue-400 font-medium text-sm bg-blue-500/10 border border-blue-500/20 inline-block px-4 py-2 rounded-lg mt-2">
          Modify existing challenge details, adjust test cases, or refine
          reference solutions.
        </p>
      </div>

      {/* Error Banner */}
      {serverError && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl mb-6 flex items-start gap-3 backdrop-blur-md">
          <AlertCircle size={20} className="shrink-0 mt-0.5" />
          <p className="text-sm font-medium">{serverError}</p>
        </div>
      )}

      {/* Success Banner (Blue Theme for Update) */}
      {successMessage && (
        <div className="bg-blue-500/10 border border-blue-500/20 text-blue-400 p-4 rounded-xl mb-6 flex items-center gap-3 backdrop-blur-md shadow-[0_0_20px_rgba(59,130,246,0.15)] animate-in slide-in-from-top-4 duration-500">
          <CheckCircle2 size={20} className="shrink-0" />
          <p className="text-sm font-bold tracking-wide">{successMessage}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit, onError)} className="space-y-8">
        {/* ── 1. CORE INFORMATION ── */}
        <div className="bg-[#111] border border-white/5 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-4">
            <FileText className="text-[#C9963A]" size={20} />
            <h2 className="font-display text-xl font-bold">Core Information</h2>
          </div>

          <div className="space-y-5">
            {/* Title */}
            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
                Problem Title
              </label>
              <input
                {...register("title")}
                className={`w-full bg-[#161618] border ${errors.title ? "border-red-500/50" : "border-white/10"} rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors`}
              />
              {errors.title && (
                <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1">
                  <AlertCircle size={12} /> {errors.title.message}
                </p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
                Description (Markdown Supported)
              </label>
              <textarea
                {...register("description")}
                className={`w-full bg-[#161618] border ${errors.description ? "border-red-500/50" : "border-white/10"} rounded-lg px-4 py-3 text-sm h-40 custom-scrollbar focus:outline-none focus:border-blue-500 transition-colors`}
              />
              {errors.description && (
                <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1">
                  <AlertCircle size={12} /> {errors.description.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Difficulty */}
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
                  Difficulty
                </label>
                <select
                  {...register("difficulty")}
                  className={`w-full bg-[#161618] border ${errors.difficulty ? "border-red-500/50" : "border-white/10"} rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors appearance-none`}
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
                {errors.difficulty && (
                  <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1">
                    <AlertCircle size={12} /> {errors.difficulty.message}
                  </p>
                )}
              </div>

              {/* Companies */}
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
                  Companies (Comma separated)
                </label>
                <input
                  {...register("companies")}
                  className="w-full bg-[#161618] border border-white/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            {/* Constraints Array */}
            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
                Constraints
              </label>
              <div className="space-y-2">
                {constraintFields.map((field, index) => (
                  <div key={field.id} className="flex gap-2">
                    <input
                      {...register(`constraints.${index}.value`)}
                      className={`flex-1 bg-[#161618] border ${errors.constraints?.[index] ? "border-red-500/50" : "border-white/10"} rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500`}
                    />
                    <button
                      type="button"
                      onClick={() => removeConstraint(index)}
                      className="px-3 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
                {errors.constraints?.root && (
                  <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1">
                    <AlertCircle size={12} /> {errors.constraints.root.message}
                  </p>
                )}
                <button
                  type="button"
                  onClick={() => appendConstraint({ value: "" })}
                  className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1 mt-2"
                >
                  <Plus size={14} /> Add Constraint
                </button>
              </div>
            </div>

            {/* Hints Array */}
            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                <Lightbulb size={14} className="text-yellow-400" /> Hints
                (Optional)
              </label>
              <div className="space-y-2">
                {hintFields.map((field, index) => (
                  <div key={field.id} className="flex gap-2">
                    <input
                      {...register(`hints.${index}.value`)}
                      className="flex-1 bg-[#161618] border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-yellow-500/50 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => removeHint(index)}
                      className="px-3 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => appendHint({ value: "" })}
                  className="text-xs font-bold text-yellow-500 hover:text-yellow-400 flex items-center gap-1 mt-2 transition-colors"
                >
                  <Plus size={14} /> Add Hint
                </button>
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Tags size={14} /> Topic Tags
              </label>
              <div className="flex flex-wrap gap-2">
                {TAG_OPTIONS.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${selectedTags?.includes(tag) ? "bg-blue-500/20 border-blue-500 text-blue-400" : "bg-[#161618] border-white/5 text-zinc-400 hover:border-white/20 hover:text-zinc-200"}`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
              {errors.tags && (
                <p className="text-red-400 text-xs mt-2 flex items-center gap-1">
                  <AlertCircle size={12} /> {errors.tags.message}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ── 2. TEST CASES ── */}
        <div className="bg-[#111] border border-white/5 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-6 border-b border-white/5 pb-4">
            <div className="flex items-center gap-3">
              <Beaker className="text-blue-400" size={20} />
              <h2 className="font-display text-xl font-bold">Test Cases</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Visible Cases */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center justify-between">
                Visible Cases (Public)
                <button
                  type="button"
                  onClick={() =>
                    appendVisible({ input: "", output: "", explanation: "" })
                  }
                  className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 bg-blue-500/10 px-2 py-1 rounded"
                >
                  <Plus size={14} /> Add Visible
                </button>
              </h3>
              <div className="space-y-4">
                {visibleFields.map((field, index) => (
                  <div
                    key={field.id}
                    className="bg-[#161618] border border-white/5 p-4 rounded-xl relative group"
                  >
                    <button
                      type="button"
                      onClick={() => removeVisible(index)}
                      className="absolute top-3 right-3 text-zinc-600 hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                    <p className="text-xs font-bold text-zinc-500 mb-3">
                      Example {index + 1}
                    </p>
                    <div className="space-y-3">
                      <input
                        {...register(`visibleTestCases.${index}.input`)}
                        className={`w-full bg-black/40 border ${errors.visibleTestCases?.[index]?.input ? "border-red-500/50" : "border-white/5"} rounded-md px-3 py-2 text-xs font-mono focus:border-blue-500/50 focus:outline-none`}
                        placeholder="Input"
                      />
                      <input
                        {...register(`visibleTestCases.${index}.output`)}
                        className={`w-full bg-black/40 border ${errors.visibleTestCases?.[index]?.output ? "border-red-500/50" : "border-white/5"} rounded-md px-3 py-2 text-xs font-mono focus:border-blue-500/50 focus:outline-none`}
                        placeholder="Expected Output"
                      />
                      <textarea
                        {...register(`visibleTestCases.${index}.explanation`)}
                        className={`w-full bg-black/40 border ${errors.visibleTestCases?.[index]?.explanation ? "border-red-500/50" : "border-white/5"} rounded-md px-3 py-2 text-xs focus:border-blue-500/50 focus:outline-none h-16`}
                        placeholder="Explanation"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Hidden Cases */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center justify-between">
                Hidden Cases (Evaluation)
                <button
                  type="button"
                  onClick={() => appendHidden({ input: "", output: "" })}
                  className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 bg-blue-500/10 px-2 py-1 rounded"
                >
                  <Plus size={14} /> Add Hidden
                </button>
              </h3>
              <div className="space-y-4">
                {hiddenFields.map((field, index) => (
                  <div
                    key={field.id}
                    className="bg-[#161618] border border-white/5 p-4 rounded-xl relative group"
                  >
                    <button
                      type="button"
                      onClick={() => removeHidden(index)}
                      className="absolute top-3 right-3 text-zinc-600 hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                    <p className="text-xs font-bold text-zinc-500 mb-3">
                      Hidden Case {index + 1}
                    </p>
                    <div className="space-y-3">
                      <input
                        {...register(`hiddenTestCases.${index}.input`)}
                        className={`w-full bg-black/40 border ${errors.hiddenTestCases?.[index]?.input ? "border-red-500/50" : "border-white/5"} rounded-md px-3 py-2 text-xs font-mono focus:border-blue-500/50 focus:outline-none`}
                        placeholder="Input payload"
                      />
                      <input
                        {...register(`hiddenTestCases.${index}.output`)}
                        className={`w-full bg-black/40 border ${errors.hiddenTestCases?.[index]?.output ? "border-red-500/50" : "border-white/5"} rounded-md px-3 py-2 text-xs font-mono focus:border-blue-500/50 focus:outline-none`}
                        placeholder="Expected Output"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── 3. CODE TEMPLATES & SOLUTIONS (Tabbed Interface) ── */}
        <div className="bg-[#111] border border-white/5 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-4 border-b border-white/5 pb-4">
            <Code2 className="text-blue-400" size={20} />
            <h2 className="font-display text-xl font-bold">
              Code Environments
            </h2>
          </div>

          {/* Language Tabs */}
          <div className="flex gap-2 mb-6 border-b border-white/5 pb-2">
            {LANGUAGES.map((lang, idx) => (
              <button
                key={lang}
                type="button"
                onClick={() => setActiveLangTab(idx)}
                className={`px-4 py-2 rounded-t-lg text-xs font-bold uppercase tracking-wider transition-colors ${activeLangTab === idx ? "text-blue-400 border-b-2 border-blue-500 bg-blue-500/10" : "text-zinc-500 hover:text-zinc-300"}`}
              >
                {lang}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
            {LANGUAGES.map((lang, idx) => (
              <div
                key={lang}
                className={
                  activeLangTab === idx
                    ? "grid grid-cols-1 lg:grid-cols-2 gap-6"
                    : "hidden"
                }
              >
                {/* Starter Code */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                      Boilerplate Starter Code ({lang})
                    </label>
                  </div>
                  <textarea
                    {...register(`starterCode.${idx}.initialCode`)}
                    className={`w-full bg-[#0a0a0a] border ${errors.starterCode?.[idx]?.initialCode ? "border-red-500/50" : "border-white/5"} rounded-xl p-4 text-xs font-mono text-zinc-300 h-[300px] custom-scrollbar focus:outline-none focus:border-blue-500/50`}
                  />
                </div>

                {/* Reference Solution */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-blue-400 uppercase tracking-wider">
                      Complete Reference Solution ({lang})
                    </label>
                  </div>
                  <textarea
                    {...register(`referenceSolution.${idx}.completeCode`)}
                    className={`w-full bg-[#0a0a0a] border ${errors.referenceSolution?.[idx]?.completeCode ? "border-red-500/50" : "border-blue-500/30"} rounded-xl p-4 text-xs font-mono text-blue-100 h-[300px] custom-scrollbar focus:outline-none focus:border-blue-400`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── SUBMIT BUTTON/CANCEL BUTTON── */}
        {/* ── ACTION BUTTONS ── */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            type="button"
            onClick={() => navigate("/admin/problems/update")}
            disabled={isSubmitting || successMessage !== ""}
            className="w-full sm:w-1/3 py-4 rounded-xl bg-[#161618] hover:bg-white/5 border border-white/10 text-zinc-300 font-bold text-lg transition-all disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isSubmitting || successMessage !== ""}
            className="w-full sm:w-2/3 py-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-lg transition-all disabled:opacity-70 flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(37,99,235,0.2)]"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={24} className="animate-spin" />
                Validating & Updating...
              </>
            ) : successMessage ? (
              <>
                <CheckCircle2 size={24} />
                Redirecting...
              </>
            ) : (
              <>
                <Save size={24} />
                Update Problem
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditProblem;
