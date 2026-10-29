import 'package:intl/intl.dart';

// Tanggal WIB (+7) untuk layar katalog.
String formatDateWIB(String iso) {
  final dt = DateTime.parse(iso).toUtc().add(const Duration(hours: 7));
  return DateFormat('d MMM y, HH:mm', 'id_ID').format(dt);
}
