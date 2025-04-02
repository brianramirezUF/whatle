import { ImageDrop } from '@/components/ImageDrop'
import ProtectedRoute from '@/components/ProtectedRoute'

export default function Create() {
    return (
      <ProtectedRoute>
        <ImageDrop />
      </ProtectedRoute>
    );
}