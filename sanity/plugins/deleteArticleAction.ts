import { definePlugin } from 'sanity';
import { DocumentActionComponent, DocumentActionsResolver } from 'sanity';

export const deleteArticleAction = definePlugin(() => {
  return {
    name: 'delete-article-action',
    document: {
      actions: (prev, { schemaType }) => {
        if (schemaType !== 'landingSupportArticle') return prev;

        const deleteAction: DocumentActionComponent = (props) => {
          return {
            label: '🗑️ Eliminar artículo',
            onHandle: async () => {
              const confirmed = window.confirm(
                `¿Estás seguro de que quieres eliminar el artículo "${props.published?.title || 'sin título'}"?\n\nEsta acción no se puede deshacer.`
              );

              if (!confirmed) return;

              try {
                await props.client.delete(props.id);
                props.onComplete?.();
              } catch (error) {
                console.error('Error al eliminar:', error);
                alert('Error al eliminar el artículo. Intenta de nuevo.');
              }
            },
            shortcut: ['ctrl', 'shift', 'd']
          };
        };

        return [...prev, deleteAction];
      }
    }
  };
});
