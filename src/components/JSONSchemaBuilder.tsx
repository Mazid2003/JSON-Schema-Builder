// JSONSchemaBuilder.tsx
import React from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import "./JSONSchemaBuilder.css";

interface FieldType {
  key: string;
  type: "string" | "number" | "float" | "boolean" | "objectid" | "array" | "nested";
  fields?: FieldType[];
}

interface FormValues {
  fields: FieldType[];
}

const getDefaultValue = (type: string) => {
  switch (type) {
    case "string": return "string";
    case "number": return 0;
    case "float": return 0.0;
    case "boolean": return true;
    case "objectid": return "<ObjectId>";
    case "array": return [];
    default: return {};
  }
};

const buildJson = (fields: FieldType[]) => {
  const result: any = {};
  fields.forEach((field) => {
    if (!field.key) return; // ✅ Skip fields with empty keys
    if (field.type === "nested" && field.fields) {
      result[field.key] = buildJson(field.fields);
    } else {
      result[field.key] = getDefaultValue(field.type);
    }
  });
  return result;
};

const RenderFields = ({ nestIndex, control, register, getValues }: any) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: nestIndex ? `fields.${nestIndex}.fields` : "fields"
  });

  return (
    <div className="field-group">
      {fields.map((field, index) => {
        const path = nestIndex ? `fields.${nestIndex}.fields.${index}` : `fields.${index}`;
        return (
          <div key={field.id} className="card">
            <div className="row">
              <input {...register(`${path}.key`)} placeholder="Field Key" className="input" />

              <Controller
                control={control}
                name={`${path}.type`}
                render={({ field }) => (
                  <select className="select" value={field.value} onChange={(e) => field.onChange(e.target.value)}>
                    <option value="string">String</option>
                    <option value="number">Number</option>
                    <option value="float">Float</option>
                    <option value="boolean">Boolean</option>
                    <option value="objectid">ObjectId</option>
                    <option value="array">Array</option>
                    <option value="nested">Nested</option>
                  </select>
                )}
              />

              <button type="button" className="delete-btn" onClick={() => remove(index)}>Delete</button>
            </div>

            {getValues(`${path}.type`) === "nested" && (
              <div className="nested">
                <RenderFields nestIndex={`${nestIndex ? `${nestIndex}.fields.${index}` : index}`} control={control} register={register} getValues={getValues} />
              </div>
            )}
          </div>
        );
      })}
      <button type="button" className="add-btn" onClick={() => append({ key: "", type: "string", fields: [] })}>➕ Add Field</button>
    </div>
  );
};

const JSONSchemaBuilder: React.FC = () => {
  const { register, control, getValues, watch } = useForm<FormValues>({
    defaultValues: { fields: [] },
  });

  const formValues = watch();

  const [activeTab, setActiveTab] = React.useState("form");

  const jsonOutput = buildJson(formValues.fields);
  const isEmpty = Object.keys(jsonOutput).length === 0;

  return (
    <div className="container">
      <div className="tabs">
        <button className={activeTab === "form" ? "tab active" : "tab"} onClick={() => setActiveTab("form")}>Schema Form</button>
        <button className={activeTab === "json" ? "tab active" : "tab"} onClick={() => setActiveTab("json")}>JSON Output</button>
      </div>

      {activeTab === "form" ? (
        <RenderFields control={control} register={register} getValues={getValues} />
      ) : (
        <textarea
          value={isEmpty ? "" : JSON.stringify(jsonOutput, null, 2)}
          readOnly
          className="json-output"
        />
      )}
    </div>
  );
};

export default JSONSchemaBuilder;
