import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../../../components/ui/dialog";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { Textarea } from "../../../../components/ui/textarea";
import { Switch } from "../../../../components/ui/switch";


interface EditEventModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  event: any;
  formData: any;
  onInputChange: any;
  onSelectChange: any;
  onSwitchChange: any;
  onSave: any;
  isUpdating: boolean;
  questions: {
    list: any[];
    loading: boolean;
    onAdd: any;
    onUpdate: any;
    onDelete: any;
    onMove: any;
  };
}

export default function EditEventModal({
  isOpen,
  onOpenChange,
  event,
  formData,
  onInputChange,
  onSelectChange,
  onSwitchChange,
  onSave,
  isUpdating,
  questions
}: EditEventModalProps) {
  if (!event) return null;
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar evento: {event.name}</DialogTitle>
        </DialogHeader>
        <form className="space-y-4" onSubmit={e => { e.preventDefault(); onSave(); }}>
          <Input name="name" value={formData.name} onChange={onInputChange} placeholder="Nombre" />
          <Textarea name="description" value={formData.description} onChange={onInputChange} placeholder="Descripción" />
          <Input type="number" name="duration_minutes" value={formData.duration_minutes} onChange={onInputChange} placeholder="Duración (min)" />
          <Input name="custom_url" value={formData.custom_url} onChange={onInputChange} placeholder="URL personalizada" />
          <div className="flex items-center gap-2">
            <Switch checked={formData.requires_confirmation} onCheckedChange={checked => onSwitchChange('requires_confirmation', checked)} />
            <span>Requiere confirmación</span>
          </div>
          {/* Preguntas */}
          <div className="mt-4">
            <h4 className="text-md font-semibold mb-2">Preguntas personalizadas</h4>
            {questions.loading ? (
              <span>Cargando...</span>
            ) : (
              <>
                {questions.list.map((q, idx) => (
                  <div key={idx} className="flex gap-2 items-center mb-2">
                    <Input value={q.question} onChange={e => questions.onUpdate(idx, 'question', e.target.value)} placeholder="Pregunta" />
                    <Switch checked={q.is_required} onCheckedChange={checked => questions.onUpdate(idx, 'is_required', checked)} />
                    <span>Requerido</span>
                    <Button variant="outline" size="sm" type="button" onClick={() => questions.onDelete(idx)}>Eliminar</Button>
                    <Button variant="outline" size="sm" type="button" onClick={() => questions.onMove(idx, 'up')}>↑</Button>
                    <Button variant="outline" size="sm" type="button" onClick={() => questions.onMove(idx, 'down')}>↓</Button>
                  </div>
                ))}
                <Button variant="outline" size="sm" type="button" onClick={questions.onAdd}>Agregar pregunta</Button>
              </>
            )}
          </div>
          <DialogFooter className="space-x-2">
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={isUpdating}>{isUpdating ? "Guardando..." : "Guardar"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}