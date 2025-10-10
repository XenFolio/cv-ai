// =====================================================
// TABLEAU UTILISATEURS ADMIN - CV-AI BACKOFFICE
// =====================================================
// Tableau complet pour la gestion des utilisateurs

import { useState } from 'react';
import { useAdmin } from '../../hooks/useAdmin';
import { AdminUser } from '../../hooks/useAdmin';
import { useAdminTheme } from '../../contexts/useAdminTheme';
import {
  
  Filter,
  
  Eye,
  
  Trash2,
  Shield,
  
  UserCheck,
  UserX,
  Calendar,
  Mail,
  FileText,
  Users
} from 'lucide-react';

interface UsersTableProps {
  users: AdminUser[];
  onRefresh: () => void;
}

export function UsersTable({ users, onRefresh }: UsersTableProps) {
  const {
    updateUserRole,
    toggleUserStatus,
    deleteUser,
    logAction
  } = useAdmin();

  const { themeClasses } = useAdminTheme();

  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<AdminUser | null>(null);

  // Changer le rôle d'un utilisateur
  const handleRoleChange = async (user: AdminUser, newRole: 'user' | 'admin') => {
    const success = await updateUserRole(user.id, newRole, user.is_active);
    if (success) {
      await logAction('change_role', 'profile', user.id, {
        old_role: user.role,
        new_role: newRole
      });
      onRefresh();
    }
  };

  // Activer/désactiver un utilisateur
  const handleToggleStatus = async (user: AdminUser) => {
    const success = await toggleUserStatus(user.id, !user.is_active);
    if (success) {
      await logAction('toggle_status', 'profile', user.id, {
        old_status: user.is_active,
        new_status: !user.is_active
      });
      onRefresh();
    }
  };

  // Supprimer un utilisateur
  const handleDeleteUser = async (user: AdminUser) => {
    const success = await deleteUser(user.id);
    if (success) {
      await logAction('delete_user', 'user', user.id, {
        email: user.email,
        name: `${user.first_name} ${user.last_name}`
      });
      setConfirmDelete(null);
      onRefresh();
    }
  };

  // Formater la date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Obtenir la couleur du statut
  const getStatusColor = (isActive: boolean, role: string) => {
    if (!isActive) return 'bg-gray-100 text-gray-800';
    if (role === 'admin') return 'bg-purple-100 text-purple-800';
    return 'bg-green-100 text-green-800';
  };

  // Obtenir le texte du statut
  const getStatusText = (isActive: boolean, role: string) => {
    if (!isActive) return 'Inactif';
    if (role === 'admin') return 'Admin';
    return 'Utilisateur';
  };

  return (
    <div className={`${themeClasses.card} rounded-lg shadow`}>
      {/* Table Header */}
      <div className={`px-6 py-4 border-b ${themeClasses.border}`}>
        <div className="flex items-center justify-between">
          <h2 className={`text-lg font-medium ${themeClasses.text}`}>
            Liste des utilisateurs ({users.length})
          </h2>
          <div className="flex items-center space-x-2">
            <button className={`p-2 ${themeClasses.textSecondary} hover:${themeClasses.text}`}>
              <Filter className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className={`${themeClasses.bgSurface}`}>
            <tr>
              <th className={`px-6 py-3 text-left text-xs font-medium ${themeClasses.textSecondary} uppercase tracking-wider`}>
                Utilisateur
              </th>
              <th className={`px-6 py-3 text-left text-xs font-medium ${themeClasses.textSecondary} uppercase tracking-wider`}>
                Rôle
              </th>
              <th className={`px-6 py-3 text-left text-xs font-medium ${themeClasses.textSecondary} uppercase tracking-wider`}>
                Contenu
              </th>
              <th className={`px-6 py-3 text-left text-xs font-medium ${themeClasses.textSecondary} uppercase tracking-wider`}>
                Dernière activité
              </th>
              <th className={`px-6 py-3 text-left text-xs font-medium ${themeClasses.textSecondary} uppercase tracking-wider`}>
                Créé le
              </th>
              <th className={`px-6 py-3 text-right text-xs font-medium ${themeClasses.textSecondary} uppercase tracking-wider`}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody className={`${themeClasses.card} divide-y ${themeClasses.border}`}>
            {users.map((user) => (
              <tr key={user.id} className={`hover:${themeClasses.bgSurface}`}>
                {/* User Info */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                        {user.first_name?.[0] || user.email[0]?.toUpperCase()}
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className={`text-sm font-medium ${themeClasses.text}`}>
                        {user.first_name} {user.last_name}
                      </div>
                      <div className={`text-sm ${themeClasses.textSecondary} flex items-center`}>
                        <Mail className="h-3 w-3 mr-1" />
                        {user.email}
                      </div>
                    </div>
                  </div>
                </td>

                {/* Role */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(user.is_active, user.role)}`}>
                    {getStatusText(user.is_active, user.role)}
                  </span>
                </td>

                {/* Content */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className={`text-sm ${themeClasses.text} space-y-1`}>
                    <div className="flex items-center">
                      <FileText className="h-3 w-3 mr-1 text-blue-400" />
                      <span>CV: {user.cv_count || 0}</span>
                    </div>
                    <div className="flex items-center">
                      <FileText className="h-3 w-3 mr-1 text-green-400" />
                      <span>Lettres: {user.letter_count || 0}</span>
                    </div>
                  </div>
                </td>

                {/* Last Activity */}
                <td className={`px-6 py-4 whitespace-nowrap text-sm ${themeClasses.textSecondary}`}>
                  {user.last_login ? (
                    <div className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {formatDate(user.last_login)}
                    </div>
                  ) : (
                    <span className="text-gray-400">Jamais</span>
                  )}
                </td>

                {/* Created At */}
                <td className={`px-6 py-4 whitespace-nowrap text-sm ${themeClasses.textSecondary}`}>
                  {formatDate(user.created_at)}
                </td>

                {/* Actions */}
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-2">
                    {/* View Details */}
                    <button
                      onClick={() => {
                        setSelectedUser(user);
                        setShowUserModal(true);
                      }}
                      className="text-blue-400 hover:text-blue-300"
                      title="Voir les détails"
                    >
                      <Eye className="h-4 w-4" />
                    </button>

                    {/* Toggle Role */}
                    {user.role !== 'admin' && (
                      <button
                        onClick={() => handleRoleChange(user, 'admin')}
                        className="text-purple-400 hover:text-purple-300"
                        title="Promouvoir admin"
                      >
                        <Shield className="h-4 w-4" />
                      </button>
                    )}

                    {/* Toggle Status */}
                    <button
                      onClick={() => handleToggleStatus(user)}
                      className={`${user.is_active ? 'text-yellow-400 hover:text-yellow-300' : 'text-green-400 hover:text-green-300'}`}
                      title={user.is_active ? 'Désactiver' : 'Activer'}
                    >
                      {user.is_active ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                    </button>

                    {/* Delete */}
                    {user.role !== 'admin' && (
                      <button
                        onClick={() => setConfirmDelete(user)}
                        className="text-red-400 hover:text-red-300"
                        title="Supprimer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}

            {/* Empty State */}
            {users.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center">
                  <div className={themeClasses.textSecondary}>
                    <Users className={`h-12 w-12 mx-auto mb-4 ${themeClasses.textSecondary}`} />
                    <p className="text-lg font-medium">Aucun utilisateur trouvé</p>
                    <p className="text-sm">Commencez par inviter des utilisateurs sur la plateforme.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${themeClasses.card} rounded-lg p-6 max-w-md w-full mx-4`}>
            <h3 className={`text-lg font-semibold ${themeClasses.text} mb-4`}>
              Confirmer la suppression
            </h3>
            <p className={`${themeClasses.textSecondary} mb-6`}>
              Êtes-vous sûr de vouloir supprimer l'utilisateur {confirmDelete.first_name} {confirmDelete.last_name} ({confirmDelete.email}) ?
              Cette action est irréversible.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className={`px-4 py-2 ${themeClasses.text} ${themeClasses.bgSurface} rounded-lg hover:${themeClasses.border}`}
              >
                Annuler
              </button>
              <button
                onClick={() => handleDeleteUser(confirmDelete)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Details Modal */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${themeClasses.card} rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto`}>
            <div className="flex justify-between items-center mb-6">
              <h3 className={`text-xl font-semibold ${themeClasses.text}`}>
                Détails de l'utilisateur
              </h3>
              <button
                onClick={() => setShowUserModal(false)}
                className={`${themeClasses.textSecondary} hover:${themeClasses.text}`}
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              {/* User Info */}
              <div className={`${themeClasses.bgSurface} p-4 rounded-lg`}>
                <h4 className={`font-medium ${themeClasses.text} mb-3`}>Informations personnelles</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className={themeClasses.textSecondary}>Nom:</span>
                    <p className="font-medium">{selectedUser.first_name} {selectedUser.last_name}</p>
                  </div>
                  <div>
                    <span className={themeClasses.textSecondary}>Email:</span>
                    <p className="font-medium">{selectedUser.email}</p>
                  </div>
                  <div>
                    <span className={themeClasses.textSecondary}>Rôle:</span>
                    <p className="font-medium">{selectedUser.role}</p>
                  </div>
                  <div>
                    <span className={themeClasses.textSecondary}>Statut:</span>
                    <p className="font-medium">{selectedUser.is_active ? 'Actif' : 'Inactif'}</p>
                  </div>
                </div>
              </div>

              {/* Content Stats */}
              <div className={`${themeClasses.bgSurface} p-4 rounded-lg`}>
                <h4 className={`font-medium ${themeClasses.text} mb-3`}>Contenu créé</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className={themeClasses.textSecondary}>CV créés:</span>
                    <p className="font-medium text-lg">{selectedUser.cv_count || 0}</p>
                  </div>
                  <div>
                    <span className={themeClasses.textSecondary}>Lettres créées:</span>
                    <p className="font-medium text-lg">{selectedUser.letter_count || 0}</p>
                  </div>
                </div>
                {selectedUser.last_document_created && (
                  <div className="mt-3 pt-3 border-t">
                    <span className={themeClasses.textSecondary}>Dernier document:</span>
                    <p className="font-medium">{formatDate(selectedUser.last_document_created)}</p>
                  </div>
                )}
              </div>

              {/* Activity */}
              <div className={`${themeClasses.bgSurface} p-4 rounded-lg`}>
                <h4 className={`font-medium ${themeClasses.text} mb-3`}>Activité</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className={themeClasses.textSecondary}>Créé le:</span>
                    <p className="font-medium">{formatDate(selectedUser.created_at)}</p>
                  </div>
                  <div>
                    <span className={themeClasses.textSecondary}>Dernière connexion:</span>
                    <p className="font-medium">
                      {selectedUser.last_login ? formatDate(selectedUser.last_login) : 'Jamais'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowUserModal(false)}
                className={`px-4 py-2 ${themeClasses.bgSurface} ${themeClasses.text} rounded-lg hover:${themeClasses.border}`}
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
