-- Trigger para enviar email cuando una operación se completa
CREATE OR REPLACE FUNCTION notify_operation_completed()
RETURNS TRIGGER AS $$
BEGIN
  -- Solo procesar si el estado cambió a 'completed'
  IF NEW.status = 'completed' AND OLD.status IS DISTINCT FROM 'completed' THEN
    -- Enviar notificación a través de pg_notify
    PERFORM pg_notify(
      'operation_completed',
      json_build_object(
        'operation_id', NEW.id,
        'user_id', NEW.user_id,
        'user_email', NEW.user_email,
        'operation_number', NEW.operation_number
      )::text
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger si no existe
DROP TRIGGER IF EXISTS operation_completed_trigger ON operations;
CREATE TRIGGER operation_completed_trigger
AFTER UPDATE ON operations
FOR EACH ROW
EXECUTE FUNCTION notify_operation_completed();

-- Trigger para enviar email cuando una operación se cancela
CREATE OR REPLACE FUNCTION notify_operation_cancelled()
RETURNS TRIGGER AS $$
BEGIN
  -- Solo procesar si el estado cambió a 'cancelled'
  IF NEW.status = 'cancelled' AND OLD.status IS DISTINCT FROM 'cancelled' THEN
    -- Enviar notificación a través de pg_notify
    PERFORM pg_notify(
      'operation_cancelled',
      json_build_object(
        'operation_id', NEW.id,
        'user_id', NEW.user_id,
        'user_email', NEW.user_email,
        'operation_number', NEW.operation_number,
        'notes', NEW.notes
      )::text
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger si no existe
DROP TRIGGER IF EXISTS operation_cancelled_trigger ON operations;
CREATE TRIGGER operation_cancelled_trigger
AFTER UPDATE ON operations
FOR EACH ROW
EXECUTE FUNCTION notify_operation_cancelled();
