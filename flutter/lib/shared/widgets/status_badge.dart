import 'package:flutter/material.dart';
import '../theme/app_theme.dart';

/// Lencana status resmi SOUQNA — Acuan Biru UNIDA Gontor & label Indonesia.
class StatusBadge extends StatelessWidget {
  final String label;
  final Color backgroundColor;
  final Color textColor;
  final BorderSide? border;
  final IconData? icon;

  const StatusBadge({
    super.key,
    required this.label,
    required this.backgroundColor,
    required this.textColor,
    this.border,
    this.icon,
  });

  factory StatusBadge.orderStatus(String status) {
    switch (status) {
      case 'pending_merchant_confirmation':
        return const StatusBadge(
          label: 'Menunggu konfirmasi',
          backgroundColor: AppTheme.warningSoft,
          textColor: AppTheme.warning,
          icon: Icons.hourglass_empty,
        );
      case 'accepted':
        return const StatusBadge(
          label: 'Diterima merchant',
          backgroundColor: AppTheme.infoSoft,
          textColor: AppTheme.info,
          icon: Icons.check_circle_outline,
        );
      case 'ready_for_pickup':
        return const StatusBadge(
          label: 'Siap diambil',
          backgroundColor: AppTheme.infoSoft,
          textColor: AppTheme.info,
          icon: Icons.storefront,
        );
      case 'out_for_delivery':
        return const StatusBadge(
          label: 'Sedang diantar',
          backgroundColor: AppTheme.infoSoft,
          textColor: AppTheme.info,
          icon: Icons.delivery_dining,
        );
      case 'received_by_buyer':
        return const StatusBadge(
          label: 'Diterima pembeli',
          backgroundColor: AppTheme.warningSoft,
          textColor: AppTheme.warning,
          icon: Icons.handshake,
        );
      case 'completed':
        return const StatusBadge(
          label: 'Selesai',
          backgroundColor: AppTheme.successSoft,
          textColor: AppTheme.success,
          icon: Icons.verified,
        );
      case 'rejected':
        return const StatusBadge(
          label: 'Ditolak',
          backgroundColor: AppTheme.dangerSoft,
          textColor: AppTheme.danger,
          icon: Icons.cancel_outlined,
        );
      case 'cancelled':
        return const StatusBadge(
          label: 'Dibatalkan',
          backgroundColor: AppTheme.surfaceMuted,
          textColor: AppTheme.muted,
          border: BorderSide(color: AppTheme.border),
          icon: Icons.block,
        );
      default:
        return StatusBadge(
          label: status,
          backgroundColor: AppTheme.surfaceMuted,
          textColor: AppTheme.muted,
        );
    }
  }

  factory StatusBadge.paymentStatus(String status) {
    if (status == 'paid') {
      return const StatusBadge(
        label: 'Lunas (COD)',
        backgroundColor: AppTheme.successSoft,
        textColor: AppTheme.success,
        icon: Icons.check,
      );
    }
    return const StatusBadge(
      label: 'Belum dibayar',
      backgroundColor: AppTheme.warningSoft,
      textColor: AppTheme.warning,
      icon: Icons.access_time,
    );
  }

  factory StatusBadge.productStatus(String status) {
    switch (status) {
      case 'published':
        return const StatusBadge(
          label: 'Tayang',
          backgroundColor: AppTheme.successSoft,
          textColor: AppTheme.success,
        );
      case 'hidden':
        return const StatusBadge(
          label: 'Disembunyikan',
          backgroundColor: AppTheme.warningSoft,
          textColor: AppTheme.warning,
        );
      case 'suspended':
        return const StatusBadge(
          label: 'Ditangguhkan',
          backgroundColor: AppTheme.dangerSoft,
          textColor: AppTheme.danger,
        );
      default:
        return StatusBadge(
          label: status,
          backgroundColor: AppTheme.surfaceMuted,
          textColor: AppTheme.muted,
        );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: backgroundColor,
        borderRadius: BorderRadius.circular(6),
        border: border != null ? Border.fromBorderSide(border!) : null,
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (icon != null) ...[
            Icon(icon, size: 12, color: textColor),
            const SizedBox(width: 4),
          ],
          Text(
            label,
            style: TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.w700,
              color: textColor,
            ),
          ),
        ],
      ),
    );
  }
}
